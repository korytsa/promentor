import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaClient, User, UserRole } from "@prisma/client";
import { randomBytes } from "crypto";
import { compare, hash } from "bcryptjs";
import { Request, Response } from "express";
import { JWT_REFRESH_EXPIRES_IN_DAYS } from "./config/auth-session.config";
import { REFRESH_TOKEN_COOKIE } from "./constants/auth-cookies.constants";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthUserResponse } from "./types/auth-response.type";
import { GoogleAuthProfile } from "./types/google-auth-profile.type";
import { JwtPayload } from "./types/jwt-payload.type";
import {
  clearAuthCookies,
  getCookieValue,
  hashRefreshToken,
  setAuthCookies,
} from "./utils/auth-cookies.util";

const BCRYPT_SALT_ROUNDS = 12;
const SESSION_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

const AUTH_USER_WITH_PASSWORD_SELECT = {
  ...SESSION_USER_SELECT,
  passwordHash: true,
} satisfies Prisma.UserSelect;
type SessionUser = Prisma.UserGetPayload<{
  select: typeof SESSION_USER_SELECT;
}>;
type AuthUserWithPassword = Prisma.UserGetPayload<{
  select: typeof AUTH_USER_WITH_PASSWORD_SELECT;
}>;

function isGoogleMentorSignupAllowed(): boolean {
  return process.env.ALLOW_GOOGLE_MENTOR_SIGNUP?.trim() === "true";
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, res: Response): Promise<AuthUserResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await hash(dto.password, BCRYPT_SALT_ROUNDS);
    const fullName = dto.fullName.trim();
    const createdUser = await this.prisma.user.create({
      data: {
        fullName,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role ?? UserRole.REGULAR_USER,
      },
      select: AUTH_USER_WITH_PASSWORD_SELECT,
    });

    await this.issueSession(res, createdUser);
    return this.mapUser(createdUser);
  }

  async login(dto: LoginDto, res: Response): Promise<AuthUserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: AUTH_USER_WITH_PASSWORD_SELECT,
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    this.ensureAccountRoleMatchesLogin(user, dto.role);

    await this.issueSession(res, user);
    return this.mapUser(user);
  }

  async loginWithGoogle(
    profile: GoogleAuthProfile,
    role: UserRole,
    res: Response,
  ): Promise<AuthUserResponse> {
    const email = profile.email.toLowerCase();
    const fullName = profile.fullName.trim();

    let user = await this.prisma.user.findUnique({
      where: { email },
      select: AUTH_USER_WITH_PASSWORD_SELECT,
    });

    if (!user) {
      if (role === UserRole.MENTOR && !isGoogleMentorSignupAllowed()) {
        throw new UnauthorizedException(
          "Mentor Google sign-up is disabled. Contact support.",
        );
      }

      user = await this.prisma.user.create({
        data: {
          fullName,
          email,
          passwordHash: await this.randomPasswordHash(),
          role,
          avatarUrl: profile.avatarUrl ?? null,
        },
        select: AUTH_USER_WITH_PASSWORD_SELECT,
      });
    }

    this.ensureAccountRoleMatchesLogin(user, role);

    await this.issueSession(res, user);
    return this.mapUser(user);
  }

  async refresh(req: Request, res: Response): Promise<AuthUserResponse> {
    const rawRefresh = getCookieValue(req, REFRESH_TOKEN_COOKIE);
    if (!rawRefresh) {
      throw new UnauthorizedException("Missing refresh token");
    }

    const tokenHash = hashRefreshToken(rawRefresh);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      clearAuthCookies(res);
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    await this.prisma.refreshToken.delete({ where: { id: record.id } });
    await this.issueSession(res, record.user);
    return this.mapUser(record.user);
  }

  async logout(req: Request, res: Response): Promise<void> {
    const rawRefresh = getCookieValue(req, REFRESH_TOKEN_COOKIE);
    if (rawRefresh) {
      const tokenHash = hashRefreshToken(rawRefresh);
      await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
    }
    clearAuthCookies(res);
  }

  async getCurrentUser(userId: string): Promise<AuthUserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: SESSION_USER_SELECT,
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return this.mapUser(user);
  }

  private ensureAccountRoleMatchesLogin(
    user: User,
    expectedRole: UserRole,
  ): void {
    if (user.role === expectedRole) {
      return;
    }
    throw new UnauthorizedException(
      user.role === UserRole.MENTOR
        ? "This account is a mentor account. Use the mentor sign-in page."
        : "This account is a regular user account. Use the regular user sign-in page.",
    );
  }

  private async randomPasswordHash(): Promise<string> {
    return hash(randomBytes(48).toString("hex"), BCRYPT_SALT_ROUNDS);
  }

  private async issueSession(res: Response, user: User): Promise<void> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const rawRefresh = randomBytes(32).toString("hex");
    const refreshTokenHash = hashRefreshToken(rawRefresh);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + JWT_REFRESH_EXPIRES_IN_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    setAuthCookies(res, accessToken, rawRefresh);
  }

  private mapUser(user: SessionUser): AuthUserResponse {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      jobTitle: user.jobTitle,
      about: user.about,
    };
  }
}
