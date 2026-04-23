import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSessionQuery } from "@/features/auth/api";
import { getRoleEntryPath } from "@/entities/user/model/constants";
import type { UserRole } from "@/entities/user/types";
import { RouteLoadingFallback } from "../RouteLoadingFallback";

type RoleRouteProps = {
  allowedRoles: readonly UserRole[];
  children: ReactNode;
};

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { data: user, isPending, isError } = useSessionQuery();

  if (isPending || isError) {
    return <RouteLoadingFallback />;
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleEntryPath(user.role)} replace />;
  }

  return children;
}
