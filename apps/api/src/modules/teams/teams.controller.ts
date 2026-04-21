import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MentorGuard } from "../auth/guards/mentor.guard";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { CreateTeamDto } from "./dto/create-team.dto";
import { InviteRegularUserDto } from "./dto/invite-regular-user.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { TeamsService } from "./teams.service";
import {
  CoachingTeamDetailResponse,
  CoachingTeamListItemResponse,
} from "./types/coaching-team-response.type";
import { UserResponse } from "../users/types/user-response.type";

@UseGuards(JwtAuthGuard)
@Controller("teams")
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  listTeams(
    @CurrentUser() user: JwtPayload,
  ): Promise<CoachingTeamListItemResponse[]> {
    return this.teamsService.listTeams(user.sub, user.role);
  }

  @Post("invite-user")
  @UseGuards(MentorGuard)
  inviteRegularUser(@Body() dto: InviteRegularUserDto): Promise<UserResponse> {
    return this.teamsService.inviteRegularUser(dto);
  }

  @Post()
  @UseGuards(MentorGuard)
  createTeam(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTeamDto,
  ): Promise<CoachingTeamListItemResponse> {
    return this.teamsService.createTeam(user.sub, dto);
  }

  @Get(":id")
  getTeam(
    @Param("id") teamId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CoachingTeamDetailResponse> {
    return this.teamsService.getTeamById(teamId, user.sub);
  }

  @Patch(":id")
  @UseGuards(MentorGuard)
  updateTeam(
    @CurrentUser() user: JwtPayload,
    @Param("id") teamId: string,
    @Body() dto: UpdateTeamDto,
  ): Promise<CoachingTeamListItemResponse> {
    return this.teamsService.updateTeam(user.sub, teamId, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(MentorGuard)
  async deleteTeam(
    @CurrentUser() user: JwtPayload,
    @Param("id") teamId: string,
  ): Promise<void> {
    await this.teamsService.deleteTeam(user.sub, teamId);
  }
}
