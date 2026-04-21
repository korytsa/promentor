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
import type { JwtPayload } from "../auth/types/jwt-payload.type";
import { CreateMentorshipRequestDto } from "./dto/create-mentorship-request.dto";
import { DecideMentorshipRequestDto } from "./dto/decide-mentorship-request.dto";
import { MentorshipService } from "./mentorship.service";
import type { MentorshipRequestInboxItemResponse } from "./types/mentorship-request-inbox-response.type";

@UseGuards(JwtAuthGuard)
@Controller("mentorship-requests")
export class MentorshipRequestsController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMentorshipRequestDto,
  ) {
    return this.mentorshipService.createMentorshipRequest(user.sub, dto);
  }

  @Get("received")
  @UseGuards(MentorGuard)
  listReceived(
    @CurrentUser() user: JwtPayload,
  ): Promise<MentorshipRequestInboxItemResponse[]> {
    return this.mentorshipService.listReceivedMentorshipRequests(user.sub);
  }

  @Patch(":id")
  @UseGuards(MentorGuard)
  decide(
    @CurrentUser() user: JwtPayload,
    @Param("id") requestId: string,
    @Body() dto: DecideMentorshipRequestDto,
  ): Promise<void> {
    return this.mentorshipService.decideMentorshipRequest(
      user.sub,
      requestId,
      dto.action,
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAsMentee(
    @CurrentUser() user: JwtPayload,
    @Param("id") requestId: string,
  ): Promise<void> {
    return this.mentorshipService.deleteMentorshipRequestAsMentee(
      user.sub,
      requestId,
    );
  }
}
