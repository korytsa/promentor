import type { ReactNode } from "react";
import { RequireGuest } from "../routeGuards";

export function GuestRoute({ children }: { children: ReactNode }) {
  return <RequireGuest>{children}</RequireGuest>;
}
