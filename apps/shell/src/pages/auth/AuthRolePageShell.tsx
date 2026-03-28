import { type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getRoleFromParam, type UserRole } from "@/entities/user";
import { AppBackground } from "@/shared/ui";

type AuthRolePageShellProps = {
  children: (role: UserRole) => ReactNode;
};

export function AuthRolePageShell({ children }: AuthRolePageShellProps) {
  const { role } = useParams();
  const parsedRole = getRoleFromParam(role);

  if (!parsedRole) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppBackground contentClassName="min-h-screen flex items-center justify-center px-4 py-10">
      {children(parsedRole)}
    </AppBackground>
  );
}
