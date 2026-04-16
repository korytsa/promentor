import type { ReactNode } from "react";
import { RequireAuth } from "../routeGuards";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
