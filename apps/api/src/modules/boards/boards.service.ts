import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import {
  assertSessionDateYmd,
  clientBoardTypeToTacticalSurface,
} from "./constants/boards.constants";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { BoardResponse, toBoardResponse } from "./types/board-response.type";
import { TeamsService } from "../teams/teams.service";

const BOARD_INCLUDE = {
  team: { select: { name: true } },
} as const;

@Injectable()
export class BoardsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly teamsService: TeamsService,
  ) {}

  async listForUser(userId: string, role: UserRole): Promise<BoardResponse[]> {
    const teamIds = await this.teamsService.getTeamIdsAccessibleToUser(
      userId,
      role,
    );
    if (teamIds.length === 0) {
      return [];
    }
    const rows = await this.prisma.tacticalBoard.findMany({
      where: { teamId: { in: teamIds } },
      orderBy: { updatedAt: "desc" },
      include: BOARD_INCLUDE,
    });
    return rows.map(toBoardResponse);
  }

  async getById(
    id: string,
    userId: string,
    role: UserRole,
  ): Promise<BoardResponse> {
    const teamIds = await this.teamsService.getTeamIdsAccessibleToUser(
      userId,
      role,
    );
    const row = await this.prisma.tacticalBoard.findUnique({
      where: { id },
      include: BOARD_INCLUDE,
    });
    if (!row) {
      throw new NotFoundException("Board not found");
    }
    if (!teamIds.includes(row.teamId)) {
      throw new ForbiddenException("You cannot view this board");
    }
    return toBoardResponse(row);
  }

  async create(mentorId: string, dto: CreateBoardDto): Promise<BoardResponse> {
    const team = await this.prisma.coachingTeam.findUnique({
      where: { id: dto.teamId },
      select: { id: true, createdById: true },
    });
    if (!team) {
      throw new NotFoundException("Team not found");
    }
    if (team.createdById !== mentorId) {
      throw new ForbiddenException(
        "You can only create boards for teams you own",
      );
    }

    const created = await this.prisma.tacticalBoard.create({
      data: {
        name: dto.name.trim(),
        teamId: dto.teamId,
        createdById: mentorId,
        sessionDate: assertSessionDateYmd(dto.sessionDate),
        boardType: clientBoardTypeToTacticalSurface(dto.boardType),
        objects: dto.objects as Prisma.InputJsonValue,
        stroke: dto.stroke,
        strokeWidth: dto.strokeWidth,
      },
      include: BOARD_INCLUDE,
    });
    return toBoardResponse(created);
  }

  async update(
    boardId: string,
    mentorId: string,
    dto: UpdateBoardDto,
  ): Promise<BoardResponse> {
    const existing = await this.prisma.tacticalBoard.findUnique({
      where: { id: boardId },
      include: { team: { select: { createdById: true } } },
    });
    if (!existing) {
      throw new NotFoundException("Board not found");
    }
    if (existing.team.createdById !== mentorId) {
      throw new ForbiddenException("Only the team mentor can edit this board");
    }

    const data: Prisma.TacticalBoardUpdateInput = {};
    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.teamId !== undefined) {
      const team = await this.prisma.coachingTeam.findUnique({
        where: { id: dto.teamId },
        select: { createdById: true },
      });
      if (!team) {
        throw new NotFoundException("Team not found");
      }
      if (team.createdById !== mentorId) {
        throw new ForbiddenException(
          "You can only assign boards to your own teams",
        );
      }
      data.team = { connect: { id: dto.teamId } };
    }
    if (dto.sessionDate !== undefined) {
      data.sessionDate = assertSessionDateYmd(dto.sessionDate);
    }
    if (dto.boardType !== undefined) {
      data.boardType = clientBoardTypeToTacticalSurface(dto.boardType);
    }
    if (dto.objects !== undefined) {
      data.objects = dto.objects as Prisma.InputJsonValue;
    }
    if (dto.stroke !== undefined) {
      data.stroke = dto.stroke;
    }
    if (dto.strokeWidth !== undefined) {
      data.strokeWidth = dto.strokeWidth;
    }

    if (Object.keys(data).length === 0) {
      const row = await this.prisma.tacticalBoard.findUniqueOrThrow({
        where: { id: boardId },
        include: BOARD_INCLUDE,
      });
      return toBoardResponse(row);
    }

    const updated = await this.prisma.tacticalBoard.update({
      where: { id: boardId },
      data,
      include: BOARD_INCLUDE,
    });
    return toBoardResponse(updated);
  }

  async remove(boardId: string, mentorId: string): Promise<void> {
    const existing = await this.prisma.tacticalBoard.findUnique({
      where: { id: boardId },
      include: { team: { select: { createdById: true } } },
    });
    if (!existing) {
      throw new NotFoundException("Board not found");
    }
    if (existing.team.createdById !== mentorId) {
      throw new ForbiddenException(
        "Only the team mentor can delete this board",
      );
    }
    await this.prisma.tacticalBoard.delete({ where: { id: boardId } });
  }
}
