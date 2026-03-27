import { UserRole } from "@/entities/user/types";
import { AuthRoleOption } from "./types";

export const AUTH_ROLES: AuthRoleOption[] = [
  {
    role: "MENTOR",
    title: "Mentor",
    description: "Team and content management with full platform access.",
  },
  {
    role: "REGULAR_USER",
    title: "Regular User",
    description: "Explore teams, connect with mentors, and collaborate.",
  },
];

export const getRoleContent = (role: UserRole): AuthRoleOption => {
  return AUTH_ROLES.find((item) => item.role === role) ?? AUTH_ROLES[1];
};
