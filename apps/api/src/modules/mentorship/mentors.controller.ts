import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtPayload } from "../auth/types/jwt-payload.type";
import { MentorshipService } from "./mentorship.service";
import type { MentorExploreRowResponse } from "./types/mentor-explore-row.type";

@UseGuards(JwtAuthGuard)
@Controller("mentors")
export class MentorsController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload): Promise<MentorExploreRowResponse[]> {
    return this.mentorshipService.listMentorsForViewer(user.sub, user.role);
  }
}
