import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSessionQuery } from "@/features/auth/api";
import { AUTH_LOGIN_REDIRECT_PATH } from "@/entities/user/model/constants";
import { ShellLayout } from "@/widgets/layout";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: user } = useSessionQuery();

  if (!user) {
    return <Navigate to={AUTH_LOGIN_REDIRECT_PATH} replace />;
  }

  return <ShellLayout>{children}</ShellLayout>;
}

export function RequireGuest({ children }: { children: ReactNode }) {
  const { data: user } = useSessionQuery();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
