import { UserRole } from "@/entities/user/types";

export interface AuthRoleOption {
  role: UserRole;
  title: string;
  description: string;
}
