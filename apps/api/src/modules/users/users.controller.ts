import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ok, withMessage } from "../../common/http/api-response";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OkResponse } from "../auth/types/auth-response.type";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { UpdateMyUserDto } from "./dto/update-my-user.dto";
import { SearchUsersQueryDto } from "./dto/search-users.query.dto";
import { UserResponse } from "./types/user-response.type";
import { UserSearchItemResponse } from "./types/user-search-response.type";
import { ThrottlerUserGuard } from "./throttler-user.guard";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listUsers(): Promise<UserResponse[]> {
    return this.usersService.listUsers();
  }

  @Get("search")
  @UseGuards(ThrottlerUserGuard)
  searchUsers(
    @CurrentUser() user: JwtPayload,
    @Query() query: SearchUsersQueryDto,
  ): Promise<UserSearchItemResponse[]> {
    return this.usersService.searchUsers(user.sub, query);
  }

  @Patch("me")
  updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateMyUserDto,
  ): Promise<UserResponse & { message: string }> {
    return this.usersService
      .updateMe(user.sub, dto)
      .then((updatedUser) =>
        withMessage(updatedUser, "Profile updated successfully"),
      );
  }

  @Delete("me")
  async deleteMe(@CurrentUser() user: JwtPayload): Promise<OkResponse> {
    await this.usersService.deleteMe(user.sub);
    return ok("Account deleted successfully");
  }
}
