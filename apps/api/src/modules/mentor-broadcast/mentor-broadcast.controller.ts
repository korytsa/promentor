import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MentorGuard } from "../auth/guards/mentor.guard";
import type { JwtPayload } from "../auth/types/jwt-payload.type";
import { CreateMentorBroadcastRequestDto } from "./dto/create-mentor-broadcast-request.dto";
import {
  MENTOR_BROADCAST_TARGET_QUERY_KIND,
  MentorBroadcastService,
} from "./mentor-broadcast.service";
import type { MentorBroadcastRequestSentItem } from "./types/mentor-broadcast-request-sent.type";

@Controller("mentor-broadcast-requests")
@UseGuards(JwtAuthGuard, MentorGuard)
export class MentorBroadcastController {
  constructor(
    private readonly mentorBroadcastService: MentorBroadcastService,
  ) {}

  @Get("sent")
  listSent(
    @CurrentUser() user: JwtPayload,
  ): Promise<MentorBroadcastRequestSentItem[]> {
    return this.mentorBroadcastService.listSent(user.sub);
  }

  @Get("targets")
  async listTargets(
    @CurrentUser() user: JwtPayload,
    @Query("kind") kind: string,
  ): Promise<{ items: { id: string; label: string }[] }> {
    if (kind === MENTOR_BROADCAST_TARGET_QUERY_KIND.INTERNS) {
      const items = await this.mentorBroadcastService.listAcceptedInterns(
        user.sub,
      );
      return { items };
    }
    if (kind === MENTOR_BROADCAST_TARGET_QUERY_KIND.BOARDS) {
      const items = await this.mentorBroadcastService.listBoardsForMentor(
        user.sub,
      );
      return { items };
    }
    throw new BadRequestException(
      `Query "kind" must be ${MENTOR_BROADCAST_TARGET_QUERY_KIND.INTERNS} or ${MENTOR_BROADCAST_TARGET_QUERY_KIND.BOARDS}`,
    );
  }
  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMentorBroadcastRequestDto,
  ): Promise<MentorBroadcastRequestSentItem> {
    return this.mentorBroadcastService.create(user.sub, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(
    @CurrentUser() user: JwtPayload,
    @Param("id") requestId: string,
  ): Promise<void> {
    await this.mentorBroadcastService.cancel(user.sub, requestId);
  }
}
