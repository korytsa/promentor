import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  PrismaClient,
  TacticalBoardSurface,
  UserRole,
} from "@prisma/client";
import { CreateTacticalBoardDto } from "./dto/create-tactical-board.dto";
import { UpdateTacticalBoardDto } from "./dto/update-tactical-board.dto";
import {
  TacticalBoardResponse,
  toTacticalBoardResponse,
} from "./types/tactical-board-response.type";
import { TeamsService } from "../teams/teams.service";

const BOARD_INCLUDE = {
  team: { select: { name: true } },
} as const;

function parseSessionDate(ymd: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    throw new BadRequestException("sessionDate must be YYYY-MM-DD");
  }
  const d = new Date(`${ymd}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException("Invalid sessionDate");
  }
  return d;
}

function surfaceFromDto(v: "hockey" | "football"): TacticalBoardSurface {
  return v === "hockey"
    ? TacticalBoardSurface.HOCKEY
    : TacticalBoardSurface.FOOTBALL;
}

@Injectable()
export class TacticalBoardsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly teamsService: TeamsService,
  ) {}

  async listForUser(
    userId: string,
    role: UserRole,
  ): Promise<TacticalBoardResponse[]> {
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
    return rows.map(toTacticalBoardResponse);
  }

  async getById(
    id: string,
    userId: string,
    role: UserRole,
  ): Promise<TacticalBoardResponse> {
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
    return toTacticalBoardResponse(row);
  }

  async create(
    mentorId: string,
    dto: CreateTacticalBoardDto,
  ): Promise<TacticalBoardResponse> {
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
        sessionDate: parseSessionDate(dto.sessionDate),
        boardType: surfaceFromDto(dto.boardType),
        objects: dto.objects as Prisma.InputJsonValue,
        stroke: dto.stroke,
        strokeWidth: dto.strokeWidth,
      },
      include: BOARD_INCLUDE,
    });
    return toTacticalBoardResponse(created);
  }

  async update(
    boardId: string,
    mentorId: string,
    dto: UpdateTacticalBoardDto,
  ): Promise<TacticalBoardResponse> {
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
      data.sessionDate = parseSessionDate(dto.sessionDate);
    }
    if (dto.boardType !== undefined) {
      data.boardType = surfaceFromDto(dto.boardType);
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
      return toTacticalBoardResponse(row);
    }

    const updated = await this.prisma.tacticalBoard.update({
      where: { id: boardId },
      data,
      include: BOARD_INCLUDE,
    });
    return toTacticalBoardResponse(updated);
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
