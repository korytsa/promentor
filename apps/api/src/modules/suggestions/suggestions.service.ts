import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  MentorshipRequestStatus,
  PrismaClient,
  SuggestionPriority,
  SuggestionTargetScope,
} from "@prisma/client";
import { MentorshipService } from "../mentorship/mentorship.service";
import { CreateUserBoardDto } from "./dto/create-user-board.dto";
import { CreateUserSuggestionDto } from "./dto/create-user-suggestion.dto";
import { UpdateUserSuggestionDto } from "./dto/update-user-suggestion.dto";
import type {
  SuggestionBoardTargetRow,
  SuggestionMentorTargetRow,
  UserSuggestionInboxItem,
  UserSuggestionSentItem,
} from "./types/suggestion-api.types";

const SUGGESTION_INCLUDE = {
  team: { select: { name: true } },
  userBoard: { select: { name: true, mentorId: true } },
  recipientMentor: { select: { id: true, fullName: true } },
} as const;

type SuggestionRowWithMeta = {
  id: string;
  scope: SuggestionTargetScope;
  recipientMentorId: string;
  teamId: string | null;
  boardId: string | null;
  title: string;
  detail: string;
  priority: SuggestionPriority;
  createdAt: Date;
  updatedAt: Date;
  team: { name: string } | null;
  userBoard: { name: string; mentorId: string } | null;
  recipientMentor: { id: string; fullName: string };
};

@Injectable()
export class SuggestionsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mentorshipService: MentorshipService,
  ) {}

  listMentorTargets(menteeId: string): Promise<SuggestionMentorTargetRow[]> {
    return this.mentorshipService.listAcceptedMentorLabelsForMentee(menteeId);
  }

  async listBoardTargets(ownerId: string): Promise<SuggestionBoardTargetRow[]> {
    const boards = await this.prisma.userBoard.findMany({
      where: { ownerId },
      orderBy: { name: "asc" },
    });
    return boards.map((b) => ({
      id: b.id,
      name: b.name,
      mentorId: b.mentorId,
    }));
  }

  async createUserBoard(
    ownerId: string,
    dto: CreateUserBoardDto,
  ): Promise<SuggestionBoardTargetRow> {
    const link = await this.prisma.mentorshipRequest.findFirst({
      where: {
        menteeId: ownerId,
        mentorId: dto.mentorId,
        status: MentorshipRequestStatus.ACCEPTED,
      },
    });
    if (!link) {
      throw new BadRequestException(
        "You can only add boards for accepted mentors of yours",
      );
    }
    const created = await this.prisma.userBoard.create({
      data: {
        name: dto.name.trim(),
        ownerId,
        mentorId: dto.mentorId,
      },
    });
    return {
      id: created.id,
      name: created.name,
      mentorId: created.mentorId,
    };
  }

  private async assertMenteeOnTeam(
    teamId: string,
    userId: string,
  ): Promise<{ createdById: string }> {
    const membership = await this.prisma.coachingTeamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (!membership) {
      throw new ForbiddenException("You are not a member of this team");
    }
    const team = await this.prisma.coachingTeam.findUnique({
      where: { id: teamId },
      select: { createdById: true },
    });
    if (!team) {
      throw new NotFoundException("Team not found");
    }
    return { createdById: team.createdById };
  }

  async createSuggestion(
    senderId: string,
    dto: CreateUserSuggestionDto,
  ): Promise<UserSuggestionSentItem> {
    if (dto.scope === SuggestionTargetScope.TEAM) {
      if (!dto.teamId) {
        throw new BadRequestException("teamId is required for TEAM scope");
      }
      if (dto.targetMentorId || dto.boardId) {
        throw new BadRequestException("Only teamId is allowed for TEAM scope");
      }
      const { createdById } = await this.assertMenteeOnTeam(
        dto.teamId,
        senderId,
      );
      const created = await this.prisma.userSuggestion.create({
        data: {
          senderId,
          scope: SuggestionTargetScope.TEAM,
          recipientMentorId: createdById,
          teamId: dto.teamId,
          boardId: null,
          title: dto.title.trim(),
          detail: dto.detail.trim(),
          priority: dto.priority,
        },
        include: SUGGESTION_INCLUDE,
      });
      return this.toSentItem(created as SuggestionRowWithMeta);
    }
    if (dto.scope === SuggestionTargetScope.MENTOR) {
      if (!dto.targetMentorId) {
        throw new BadRequestException(
          "targetMentorId is required for MENTOR scope",
        );
      }
      if (dto.teamId || dto.boardId) {
        throw new BadRequestException(
          "Only targetMentorId is allowed for MENTOR scope",
        );
      }
      const link = await this.prisma.mentorshipRequest.findFirst({
        where: {
          menteeId: senderId,
          mentorId: dto.targetMentorId,
          status: MentorshipRequestStatus.ACCEPTED,
        },
      });
      if (!link) {
        throw new BadRequestException("No active mentorship with this mentor");
      }
      const created = await this.prisma.userSuggestion.create({
        data: {
          senderId,
          scope: SuggestionTargetScope.MENTOR,
          recipientMentorId: dto.targetMentorId,
          teamId: null,
          boardId: null,
          title: dto.title.trim(),
          detail: dto.detail.trim(),
          priority: dto.priority,
        },
        include: SUGGESTION_INCLUDE,
      });
      return this.toSentItem(created as SuggestionRowWithMeta);
    }
    if (dto.scope === SuggestionTargetScope.BOARD) {
      if (!dto.boardId) {
        throw new BadRequestException("boardId is required for BOARD scope");
      }
      if (dto.teamId || dto.targetMentorId) {
        throw new BadRequestException(
          "Only boardId is allowed for BOARD scope",
        );
      }
      const board = await this.prisma.userBoard.findFirst({
        where: { id: dto.boardId, ownerId: senderId },
      });
      if (!board) {
        throw new NotFoundException("Board not found");
      }
      const created = await this.prisma.userSuggestion.create({
        data: {
          senderId,
          scope: SuggestionTargetScope.BOARD,
          recipientMentorId: board.mentorId,
          teamId: null,
          boardId: board.id,
          title: dto.title.trim(),
          detail: dto.detail.trim(),
          priority: dto.priority,
        },
        include: SUGGESTION_INCLUDE,
      });
      return this.toSentItem(created as SuggestionRowWithMeta);
    }
    throw new BadRequestException("Invalid scope");
  }

  private toSentItem(row: SuggestionRowWithMeta): UserSuggestionSentItem {
    return {
      id: row.id,
      scope: row.scope,
      recipientMentorId: row.recipientMentorId,
      teamId: row.teamId,
      boardId: row.boardId,
      teamName: row.team?.name ?? null,
      boardName: row.userBoard?.name ?? null,
      targetMentorName: row.recipientMentor.fullName,
      title: row.title,
      detail: row.detail,
      priority: row.priority,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async listMySuggestions(senderId: string): Promise<UserSuggestionSentItem[]> {
    const rows = await this.prisma.userSuggestion.findMany({
      where: { senderId },
      orderBy: { createdAt: "desc" },
      include: SUGGESTION_INCLUDE,
    });
    return rows.map((r) => this.toSentItem(r as SuggestionRowWithMeta));
  }

  async updateSuggestion(
    senderId: string,
    id: string,
    dto: UpdateUserSuggestionDto,
  ): Promise<UserSuggestionSentItem> {
    const found = await this.prisma.userSuggestion.findUnique({
      where: { id },
      include: SUGGESTION_INCLUDE,
    });
    if (!found) {
      throw new NotFoundException("Suggestion not found");
    }
    if (found.senderId !== senderId) {
      throw new ForbiddenException("Not your suggestion");
    }
    const row = await this.prisma.userSuggestion.update({
      where: { id },
      data: {
        title: dto.title.trim(),
        detail: dto.detail.trim(),
        priority: dto.priority,
      },
      include: SUGGESTION_INCLUDE,
    });
    return this.toSentItem(row as SuggestionRowWithMeta);
  }

  async deleteSuggestion(senderId: string, id: string): Promise<void> {
    const found = await this.prisma.userSuggestion.findUnique({
      where: { id },
    });
    if (!found) {
      throw new NotFoundException("Suggestion not found");
    }
    if (found.senderId !== senderId) {
      throw new ForbiddenException("Not your suggestion");
    }
    await this.prisma.userSuggestion.delete({ where: { id } });
  }

  async listReceivedForMentor(
    mentorId: string,
  ): Promise<UserSuggestionInboxItem[]> {
    const rows = await this.prisma.userSuggestion.findMany({
      where: { recipientMentorId: mentorId },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
        team: { select: { name: true } },
        userBoard: { select: { name: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      scope: r.scope,
      title: r.title,
      detail: r.detail,
      priority: r.priority,
      sender: {
        id: r.sender.id,
        fullName: r.sender.fullName,
        avatarUrl: r.sender.avatarUrl,
      },
      teamName: r.team?.name ?? null,
      boardName: r.userBoard?.name ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }
}
