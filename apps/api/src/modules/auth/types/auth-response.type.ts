import { UserRole } from "@prisma/client";

export interface AuthUserResponse {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthSessionResponse {
  user: AuthUserResponse;
}
