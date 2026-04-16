import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Request, Response } from "express";
import { ok, withMessage } from "../../common/http/api-response";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GoogleOAuthRequestUser } from "./strategies/google.strategy";
import {
  AuthSessionResponse,
  AuthUserResponse,
  OkResponse,
} from "./types/auth-response.type";
import { JwtPayload } from "./types/jwt-payload.type";
import { getRoleParam } from "./utils/google-auth-state.util";

function getFrontendOrigin(): string {
  return process.env.FRONTEND_URL?.trim() || "http://localhost:5173";
}

function getAuthPath(mode: "login" | "register", role: UserRole): string {
  return `/${mode}/${getRoleParam(role)}`;
}

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @UseGuards(GoogleAuthGuard)
  @Get("google")
  googleAuth(): void {
    return;
  }

  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async googleCallback(
    @Req() req: Request & { user?: GoogleOAuthRequestUser },
    @Res() res: Response,
  ): Promise<void> {
    const authState = req.user?.state;
    const fallbackRole = UserRole.REGULAR_USER;
    const role = authState?.role ?? fallbackRole;
    const mode = authState?.mode ?? "login";

    try {
      if (!req.user?.profile) {
        throw new Error("Google user profile was not received.");
      }
      await this.authService.loginWithGoogle(req.user.profile, role, res);
      res.redirect(getFrontendOrigin());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown OAuth error";
      this.logger.warn(
        `Google OAuth failed for role=${role}, mode=${mode}. Reason: ${message}`,
      );
      res.redirect(
        `${getFrontendOrigin()}${getAuthPath(mode, role)}?oauth=failed`,
      );
    }
  }

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponse> {
    const user = await this.authService.register(dto, res);
    return withMessage({ user }, "Registration successful");
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponse> {
    const user = await this.authService.login(dto, res);
    return withMessage({ user }, "Login successful");
  }

  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponse> {
    const user = await this.authService.refresh(req, res);
    return withMessage({ user }, "Session refreshed successfully");
  }

  @Post("logout")
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<OkResponse> {
    await this.authService.logout(req, res);
    return ok("Logout successful");
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: JwtPayload): Promise<AuthUserResponse> {
    return this.authService.getCurrentUser(user.sub);
  }
}
