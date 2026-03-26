import { UserRole } from "@/entities/user/types";

export const getRoleFromParam = (role: string | undefined): UserRole | null => {
  if (role === "mentor") {
    return "MENTOR";
  }

  if (
    role === "regular_user" ||
    role === "regular-user" ||
    role === "regular"
  ) {
    return "REGULAR_USER";
  }

  return null;
};
