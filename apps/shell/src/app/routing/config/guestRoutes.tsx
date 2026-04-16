import type { ReactNode } from "react";
import { LoginPage, RegisterPage } from "@/pages";

export type GuestRouteConfig = {
  path: string;
  element: ReactNode;
};

export const guestRoutes: GuestRouteConfig[] = [
  {
    path: "/login/:role",
    element: <LoginPage />,
  },
  {
    path: "/register/:role",
    element: <RegisterPage />,
  },
];
