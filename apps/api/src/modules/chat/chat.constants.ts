/** Aligned with DTO validation and DB text limits for chat bodies. */
export const CHAT_MESSAGE_MAX_LENGTH = 10_000;

const ROOM_ID_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isChatRoomIdParam(value: string): boolean {
  return ROOM_ID_UUID_RE.test(value.trim());
}

export type MemberForPresentation = {
  userId: string;
  user: { fullName: string; avatarUrl: string | null };
};

export const DEFAULT_MESSAGES_LIMIT = 30;
export const DEFAULT_MESSAGES_OFFSET = 0;

export const USER_PUBLIC_SELECT = {
  id: true,
  fullName: true,
  avatarUrl: true,
} as const;

export const ROOM_MEMBERS_WITH_USERS_INCLUDE = {
  orderBy: { joinedAt: "asc" as const },
  include: {
    user: {
      select: USER_PUBLIC_SELECT,
    },
  },
};
