import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  MentorshipRequestStatus,
  MentorBroadcastScope,
  MentorBroadcastStatus,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { MentorshipService } from "../mentorship/mentorship.service";
import { CreateMentorBroadcastRequestDto } from "./dto/create-mentor-broadcast-request.dto";
import type { MentorBroadcastRequestSentItem } from "./types/mentor-broadcast-request-sent.type";

export const MENTOR_BROADCAST_ALL_INTERNS_TARGET_LABEL = "All interns" as const;

export const MENTOR_BROADCAST_TARGET_QUERY_KIND = {
  INTERNS: "interns",
  BOARDS: "boards",
} as const;

const sentSelect = {
  id: true,
  scope: true,
  teamId: true,
  menteeId: true,
  boardId: true,
  targetLabel: true,
  contextLine: true,
  body: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

type SentRow = {
  id: string;
  scope: MentorBroadcastScope;
  teamId: string | null;
  menteeId: string | null;
  boardId: string | null;
  targetLabel: string;
  contextLine: string | null;
  body: string;
  status: MentorBroadcastStatus;
  createdAt: Date;
  updatedAt: Date;
};

function trimBroadcastText(dto: CreateMentorBroadcastRequestDto) {
  return {
    body: dto.body.trim(),
    contextLine: dto.contextLine?.trim() || null,
  } as const;
}

function toSentItem(row: SentRow): MentorBroadcastRequestSentItem {
  return {
    id: row.id,
    scope: row.scope,
    teamId: row.teamId,
    menteeId: row.menteeId,
    boardId: row.boardId,
    targetLabel: row.targetLabel,
    contextLine: row.contextLine,
    body: row.body,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class MentorBroadcastService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mentorshipService: MentorshipService,
  ) {}

  listAcceptedInterns(
    mentorId: string,
  ): Promise<{ id: string; label: string }[]> {
    return this.mentorshipService.listAcceptedMenteeLabelsForMentor(mentorId);
  }

  async listBoardsForMentor(
    mentorId: string,
  ): Promise<{ id: string; label: string }[]> {
    const boards = await this.prisma.userBoard.findMany({
      where: { mentorId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return boards.map((b) => ({ id: b.id, label: b.name }));
  }

  async listSent(mentorId: string): Promise<MentorBroadcastRequestSentItem[]> {
    const rows = await this.prisma.mentorBroadcastRequest.findMany({
      where: {
        mentorId,
        status: MentorBroadcastStatus.DELIVERED,
      },
      orderBy: { createdAt: "desc" },
      select: sentSelect,
    });
    return rows.map(toSentItem);
  }

  async create(
    mentorId: string,
    dto: CreateMentorBroadcastRequestDto,
  ): Promise<MentorBroadcastRequestSentItem> {
    if (dto.scope === MentorBroadcastScope.TEAM) {
      if (!dto.teamId?.trim()) {
        throw new BadRequestException("teamId is required for TEAM scope");
      }
      const team = await this.prisma.coachingTeam.findUnique({
        where: { id: dto.teamId },
        select: { id: true, name: true, createdById: true },
      });
      if (!team) {
        throw new NotFoundException("Team not found");
      }
      if (team.createdById !== mentorId) {
        throw new ForbiddenException("You can only target teams you own");
      }
      const { body, contextLine } = trimBroadcastText(dto);
      const data: Prisma.MentorBroadcastRequestCreateInput = {
        mentor: { connect: { id: mentorId } },
        scope: MentorBroadcastScope.TEAM,
        team: { connect: { id: team.id } },
        targetLabel: team.name,
        contextLine,
        body,
      };
      const created = await this.prisma.mentorBroadcastRequest.create({
        data,
        select: sentSelect,
      });
      return toSentItem(created);
    }

    if (dto.teamId) {
      throw new BadRequestException("teamId must not be set for this scope");
    }

    if (dto.boardId?.trim() && dto.scope !== MentorBroadcastScope.BOARD) {
      throw new BadRequestException("boardId is only valid for BOARD scope");
    }

    if (dto.scope === MentorBroadcastScope.INTERN) {
      if (dto.allInterns === true) {
        if (dto.menteeId) {
          throw new BadRequestException(
            "Do not set menteeId when allInterns is true",
          );
        }
        const { body, contextLine } = trimBroadcastText(dto);
        const data: Prisma.MentorBroadcastRequestCreateInput = {
          mentor: { connect: { id: mentorId } },
          scope: MentorBroadcastScope.INTERN,
          targetLabel: MENTOR_BROADCAST_ALL_INTERNS_TARGET_LABEL,
          contextLine,
          body,
        };
        const created = await this.prisma.mentorBroadcastRequest.create({
          data,
          select: sentSelect,
        });
        return toSentItem(created);
      }
      if (!dto.menteeId?.trim()) {
        throw new BadRequestException(
          "Set menteeId to target one intern, or allInterns: true to message everyone",
        );
      }
      const link = await this.prisma.mentorshipRequest.findFirst({
        where: {
          mentorId,
          menteeId: dto.menteeId,
          status: MentorshipRequestStatus.ACCEPTED,
        },
        select: {
          mentee: { select: { id: true, fullName: true } },
        },
      });
      if (!link) {
        throw new BadRequestException(
          "This user is not an accepted intern of yours",
        );
      }
      const { body, contextLine } = trimBroadcastText(dto);
      const data: Prisma.MentorBroadcastRequestCreateInput = {
        mentor: { connect: { id: mentorId } },
        scope: MentorBroadcastScope.INTERN,
        mentee: { connect: { id: link.mentee.id } },
        targetLabel: link.mentee.fullName,
        contextLine,
        body,
      };
      const created = await this.prisma.mentorBroadcastRequest.create({
        data,
        select: sentSelect,
      });
      return toSentItem(created);
    }

    if (dto.scope === MentorBroadcastScope.BOARD) {
      if (dto.allInterns || dto.menteeId) {
        throw new BadRequestException(
          "menteeId and allInterns are only for INTERN scope",
        );
      }
      const boardId = dto.boardId?.trim() ?? "";
      if (!boardId) {
        throw new BadRequestException(
          "boardId is required for BOARD scope (a user board you mentor)",
        );
      }
      const board = await this.prisma.userBoard.findFirst({
        where: { id: boardId, mentorId },
        select: { id: true, name: true },
      });
      if (!board) {
        throw new NotFoundException("Board not found or not available to you");
      }
      const { body, contextLine } = trimBroadcastText(dto);
      const data: Prisma.MentorBroadcastRequestCreateInput = {
        mentor: { connect: { id: mentorId } },
        scope: MentorBroadcastScope.BOARD,
        userBoard: { connect: { id: board.id } },
        targetLabel: board.name,
        contextLine,
        body,
      };
      const created = await this.prisma.mentorBroadcastRequest.create({
        data,
        select: sentSelect,
      });
      return toSentItem(created);
    }

    throw new BadRequestException("Unsupported scope");
  }

  async cancel(mentorId: string, requestId: string): Promise<void> {
    const request = await this.prisma.mentorBroadcastRequest.findUnique({
      where: { id: requestId },
      select: { id: true, mentorId: true, status: true },
    });
    if (!request) {
      throw new NotFoundException("Request not found");
    }
    if (request.mentorId !== mentorId) {
      throw new ForbiddenException("You can only cancel your own requests");
    }
    if (request.status !== MentorBroadcastStatus.DELIVERED) {
      throw new BadRequestException("This request is already finalised");
    }
    await this.prisma.mentorBroadcastRequest.update({
      where: { id: requestId },
      data: { status: MentorBroadcastStatus.CANCELLED },
    });
  }
}
