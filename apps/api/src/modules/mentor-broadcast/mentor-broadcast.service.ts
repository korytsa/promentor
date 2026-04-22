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
  PrismaClient,
} from "@prisma/client";
import { CreateMentorBroadcastRequestDto } from "./dto/create-mentor-broadcast-request.dto";
import type { MentorBroadcastRequestSentItem } from "./types/mentor-broadcast-request-sent.type";

const sentSelect = {
  id: true,
  scope: true,
  teamId: true,
  menteeId: true,
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
  targetLabel: string;
  contextLine: string | null;
  body: string;
  status: MentorBroadcastStatus;
  createdAt: Date;
  updatedAt: Date;
};

function toSentItem(row: SentRow): MentorBroadcastRequestSentItem {
  return {
    id: row.id,
    scope: row.scope,
    teamId: row.teamId,
    menteeId: row.menteeId,
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
  constructor(private readonly prisma: PrismaClient) {}

  async listAcceptedInterns(
    mentorId: string,
  ): Promise<{ id: string; label: string }[]> {
    const rows = await this.prisma.mentorshipRequest.findMany({
      where: {
        mentorId,
        status: MentorshipRequestStatus.ACCEPTED,
      },
      select: {
        mentee: { select: { id: true, fullName: true } },
      },
    });
    return [...rows]
      .sort((a, b) =>
        a.mentee.fullName.localeCompare(b.mentee.fullName, "en", {
          sensitivity: "base",
        }),
      )
      .map((r) => ({ id: r.mentee.id, label: r.mentee.fullName }));
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
    return (rows as SentRow[]).map(toSentItem);
  }

  async create(
    mentorId: string,
    dto: CreateMentorBroadcastRequestDto,
  ): Promise<MentorBroadcastRequestSentItem> {
    if (dto.scope === "TEAM") {
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
      const body = dto.body.trim();
      const contextLine = dto.contextLine?.trim() || null;
      const created = await this.prisma.mentorBroadcastRequest.create({
        data: {
          mentorId,
          scope: "TEAM",
          teamId: team.id,
          menteeId: null,
          targetLabel: team.name,
          contextLine,
          body,
        } as never,
        select: sentSelect,
      });
      return toSentItem(created as SentRow);
    }

    if (dto.teamId) {
      throw new BadRequestException("teamId must not be set for this scope");
    }

    if (dto.scope === "INTERN") {
      if (dto.allInterns === true) {
        if (dto.menteeId) {
          throw new BadRequestException(
            "Do not set menteeId when allInterns is true",
          );
        }
        const body = dto.body.trim();
        const contextLine = dto.contextLine?.trim() || null;
        const created = await this.prisma.mentorBroadcastRequest.create({
          data: {
            mentorId,
            scope: "INTERN",
            teamId: null,
            menteeId: null,
            targetLabel: "All interns",
            contextLine,
            body,
          } as never,
          select: sentSelect,
        });
        return toSentItem(created as SentRow);
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
      const body = dto.body.trim();
      const contextLine = dto.contextLine?.trim() || null;
      const created = await this.prisma.mentorBroadcastRequest.create({
        data: {
          mentorId,
          scope: "INTERN",
          teamId: null,
          menteeId: link.mentee.id,
          targetLabel: link.mentee.fullName,
          contextLine,
          body,
        } as never,
        select: sentSelect,
      });
      return toSentItem(created as SentRow);
    }

    if (dto.scope === "BOARD") {
      if (dto.allInterns || dto.menteeId) {
        throw new BadRequestException(
          "menteeId and allInterns are only for INTERN scope",
        );
      }
      const label = dto.targetLabel?.trim() ?? "";
      if (!label) {
        throw new BadRequestException(
          "targetLabel is required for BOARD scope",
        );
      }
      const body = dto.body.trim();
      const contextLine = dto.contextLine?.trim() || null;
      const created = await this.prisma.mentorBroadcastRequest.create({
        data: {
          mentorId,
          scope: "BOARD",
          teamId: null,
          menteeId: null,
          targetLabel: label,
          contextLine,
          body,
        } as never,
        select: sentSelect,
      });
      return toSentItem(created as SentRow);
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
