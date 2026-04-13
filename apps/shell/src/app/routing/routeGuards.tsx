import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSessionQuery } from "@/features/auth/api";
import {
  AUTH_APP_HOME_PATH,
  AUTH_LOGIN_REDIRECT_PATH,
} from "@/entities/user/model/constants";
import { ShellLayout } from "@/widgets/layout";
import { RouteLoadingFallback } from "./RouteLoadingFallback";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: user, isPending, isError } = useSessionQuery();

  if (isPending) {
    return <RouteLoadingFallback />;
  }

  if (isError) {
    return <RouteLoadingFallback />;
  }

  if (!user) {
    return <Navigate to={AUTH_LOGIN_REDIRECT_PATH} replace />;
  }

  return <ShellLayout user={user}>{children}</ShellLayout>;
}

export function RequireGuest({ children }: { children: ReactNode }) {
  const { data: user, isPending, isError } = useSessionQuery();

  if (isPending) {
    return <RouteLoadingFallback />;
  }

  if (isError) {
    return <RouteLoadingFallback />;
  }

  if (user) {
    return <Navigate to={AUTH_APP_HOME_PATH} replace />;
  }

  return children;
}

export function UnknownPathRedirect() {
  const { data: user, isPending, isError } = useSessionQuery();

  if (isPending) {
    return <RouteLoadingFallback />;
  }

  if (isError) {
    return <RouteLoadingFallback />;
  }

  if (user) {
    return <Navigate to={AUTH_APP_HOME_PATH} replace />;
  }

  return <Navigate to={AUTH_LOGIN_REDIRECT_PATH} replace />;
}
