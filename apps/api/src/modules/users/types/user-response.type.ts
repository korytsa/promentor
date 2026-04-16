import { Prisma, UserRole } from "@prisma/client";

export const USER_RESPONSE_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  avatarUrl: true,
  jobTitle: true,
  about: true,
} as const;

export type UserResponse = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  jobTitle: string | null;
  about: string | null;
};

export type UserResponseRecord = Prisma.UserGetPayload<{
  select: typeof USER_RESPONSE_SELECT;
}>;

export function toUserResponse(user: UserResponseRecord): UserResponse {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    jobTitle: user.jobTitle,
    about: user.about,
  };
}
