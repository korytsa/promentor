export type UserRole = "MENTOR" | "REGULAR_USER";
export type AuthMode = "login" | "register";

export interface NavItem {
  label: string;
  to: string;
}

export interface AuthRoleOption {
  role: UserRole;
  title: string;
  description: string;
}

export interface User {
  id: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  email: string;
}
