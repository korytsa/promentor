import { Prisma, UserRole } from "@prisma/client";

export const USER_LIST_ITEM_SELECT = {
  id: true,
  fullName: true,
  role: true,
  avatarUrl: true,
  jobTitle: true,
} as const;

export type UserListItemResponse = {
  id: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  jobTitle: string | null;
};

export type UserListItemRecord = Prisma.UserGetPayload<{
  select: typeof USER_LIST_ITEM_SELECT;
}>;

export function toUserListItemResponse(
  user: UserListItemRecord,
): UserListItemResponse {
  return {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    jobTitle: user.jobTitle,
  };
}
