import type { TacticalBoard } from "@prisma/client";
import {
  SESSION_DATE_SLICE_LENGTH,
  type BoardTypeClient,
  tacticalSurfaceToClientType,
} from "../constants/boards.constants";

type Row = TacticalBoard & { team: { name: string } };

export type BoardResponse = {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  sessionDate: string;
  boardType: BoardTypeClient;
  objects: unknown;
  stroke: string;
  strokeWidth: number;
  updatedAt: string;
  createdById: string;
};

export function toBoardResponse(row: Row): BoardResponse {
  return {
    id: row.id,
    name: row.name,
    teamId: row.teamId,
    teamName: row.team.name,
    sessionDate: row.sessionDate
      .toISOString()
      .slice(0, SESSION_DATE_SLICE_LENGTH),
    boardType: tacticalSurfaceToClientType(row.boardType),
    objects: row.objects,
    stroke: row.stroke,
    strokeWidth: row.strokeWidth,
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
  };
}
