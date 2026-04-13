import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { SearchUsersQueryDto } from "./dto/search-users.query.dto";
import { UserSearchItemResponse } from "./types/user-search-response.type";

const DEFAULT_SEARCH_LIMIT = 20;
const MAX_SEARCH_LIMIT = 50;

const USER_SEARCH_SELECT = {
  id: true,
  fullName: true,
  avatarUrl: true,
  jobTitle: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

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
}
