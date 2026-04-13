import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { SearchUsersQueryDto } from "./dto/search-users.query.dto";
import { UserSearchItemResponse } from "./types/user-search-response.type";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("search")
  @UseGuards(ThrottlerGuard)
  searchUsers(
    @CurrentUser() user: JwtPayload,
    @Query() query: SearchUsersQueryDto,
  ): Promise<UserSearchItemResponse[]> {
    return this.usersService.searchUsers(user.sub, query);
  }
}
