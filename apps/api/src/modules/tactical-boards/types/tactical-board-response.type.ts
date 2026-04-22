import type { TacticalBoard } from "@prisma/client";
import { TacticalBoardSurface } from "@prisma/client";

type Row = TacticalBoard & { team: { name: string } };

export type TacticalBoardResponse = {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  sessionDate: string;
  boardType: "hockey" | "football";
  objects: unknown;
  stroke: string;
  strokeWidth: number;
  updatedAt: string;
  createdById: string;
};

function surfaceToClient(t: TacticalBoardSurface): "hockey" | "football" {
  return t === TacticalBoardSurface.HOCKEY ? "hockey" : "football";
}

export function toTacticalBoardResponse(row: Row): TacticalBoardResponse {
  return {
    id: row.id,
    name: row.name,
    teamId: row.teamId,
    teamName: row.team.name,
    sessionDate: row.sessionDate.toISOString().slice(0, 10),
    boardType: surfaceToClient(row.boardType),
    objects: row.objects,
    stroke: row.stroke,
    strokeWidth: row.strokeWidth,
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
  };
}
