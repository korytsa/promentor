import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MentorGuard } from "../auth/guards/mentor.guard";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { DecideTeamJoinRequestDto } from "./dto/decide-team-join-request.dto";
import { TeamsService } from "./teams.service";
import type { TeamJoinRequestInboxItemResponse } from "./types/team-join-request-inbox-response.type";

@UseGuards(JwtAuthGuard)
@Controller("team-join-requests")
export class TeamJoinRequestsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get("received")
  @UseGuards(MentorGuard)
  listReceived(
    @CurrentUser() user: JwtPayload,
  ): Promise<TeamJoinRequestInboxItemResponse[]> {
    return this.teamsService.listReceivedJoinRequests(user.sub);
  }

  @Patch(":id")
  @UseGuards(MentorGuard)
  decide(
    @CurrentUser() user: JwtPayload,
    @Param("id") requestId: string,
    @Body() dto: DecideTeamJoinRequestDto,
  ): Promise<void> {
    return this.teamsService.decideJoinRequest(user.sub, requestId, dto.action);
  }
}
