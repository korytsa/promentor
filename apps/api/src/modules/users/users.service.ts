import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { ListUsersQueryDto } from "./dto/list-users.query.dto";
import { UpdateMyUserDto } from "./dto/update-my-user.dto";
import { SearchUsersQueryDto } from "./dto/search-users.query.dto";
import { UsersListResponse } from "./types/user-list-response.type";
import {
  toUserResponse,
  USER_RESPONSE_SELECT,
  UserResponse,
} from "./types/user-response.type";
import { UserSearchItemResponse } from "./types/user-search-response.type";

const DEFAULT_SEARCH_LIMIT = 20;
const MAX_SEARCH_LIMIT = 50;
const DEFAULT_LIST_LIMIT = 25;
const MAX_LIST_LIMIT = 100;
const DEFAULT_LIST_OFFSET = 0;

const USER_SEARCH_SELECT = {
  id: true,
  fullName: true,
  avatarUrl: true,
  jobTitle: true,
} as const;

function isRecordNotFoundError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025")
  );
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  async listUsers(query: ListUsersQueryDto): Promise<UsersListResponse> {
    const limit = query.limit ?? DEFAULT_LIST_LIMIT;
    const offset = query.offset ?? DEFAULT_LIST_OFFSET;

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        select: USER_RESPONSE_SELECT,
        orderBy: [{ fullName: "asc" }, { createdAt: "asc" }],
        skip: offset,
        take: Math.min(limit, MAX_LIST_LIMIT),
      }),
    ]);

    return {
      items: users.map(toUserResponse),
      total,
      limit: Math.min(limit, MAX_LIST_LIMIT),
      offset,
    };
  }

  async searchUsers(
    currentUserId: string,
    query: SearchUsersQueryDto,
  ): Promise<UserSearchItemResponse[]> {
    const q = query.q.trim();
    if (!q) {
      throw new BadRequestException("Search query cannot be empty");
    }

    const limit = Math.min(
      query.limit ?? DEFAULT_SEARCH_LIMIT,
      MAX_SEARCH_LIMIT,
    );

    const where: Prisma.UserWhereInput = {
      id: { not: currentUserId },
      OR: [
        { fullName: { contains: q, mode: "insensitive" } },
        { jobTitle: { contains: q, mode: "insensitive" } },
      ],
    };

    const rows = await this.prisma.user.findMany({
      where,
      select: USER_SEARCH_SELECT,
      orderBy: { fullName: "asc" },
      take: limit,
    });

    return rows;
  }

  async updateMe(userId: string, dto: UpdateMyUserDto): Promise<UserResponse> {
    const data: Prisma.UserUpdateInput = {};

    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName;
    }
    if (dto.avatarUrl !== undefined) {
      data.avatarUrl = dto.avatarUrl;
    }
    if (dto.jobTitle !== undefined) {
      data.jobTitle = dto.jobTitle;
    }
    if (dto.about !== undefined) {
      data.about = dto.about;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        "At least one profile field must be provided",
      );
    }

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data,
        select: USER_RESPONSE_SELECT,
      });

      return toUserResponse(user);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException("User not found");
      }
      throw error;
    }
  }

  async deleteMe(userId: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException("User not found");
      }
      throw error;
    }
  }
}
