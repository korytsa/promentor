import { BadRequestException } from "@nestjs/common";
import { TacticalBoardSurface } from "@prisma/client";

const SESSION_DATE_YMD = /^\d{4}-\d{2}-\d{2}$/;

const localDateAtNoonUtc = (ymd: string) => `${ymd}T12:00:00.000Z`;

export const SESSION_DATE_SLICE_LENGTH = 10;

export function assertSessionDateYmd(ymd: string): Date {
  if (!SESSION_DATE_YMD.test(ymd)) {
    throw new BadRequestException("sessionDate must be YYYY-MM-DD");
  }
  const d = new Date(localDateAtNoonUtc(ymd));
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException("Invalid sessionDate");
  }
  return d;
}

export const BOARD_TYPE_CLIENT = ["hockey", "football"] as const;
export type BoardTypeClient = (typeof BOARD_TYPE_CLIENT)[number];

export function clientBoardTypeToTacticalSurface(
  v: BoardTypeClient,
): TacticalBoardSurface {
  return v === "hockey"
    ? TacticalBoardSurface.HOCKEY
    : TacticalBoardSurface.FOOTBALL;
}

export function tacticalSurfaceToClientType(
  t: TacticalBoardSurface,
): BoardTypeClient {
  return t === TacticalBoardSurface.HOCKEY ? "hockey" : "football";
}
