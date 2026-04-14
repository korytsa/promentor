import { UserRole } from "@prisma/client";

export interface AuthUserResponse {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  jobTitle: string | null;
  about: string | null;
}

export interface AuthSessionResponse {
  user: AuthUserResponse;
}
