export type UserRole = "MENTOR" | "REGULAR_USER";

export interface User {
  id: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  email: string;
}
