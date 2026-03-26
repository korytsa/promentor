import { ReactNode } from "react";
import { UserRole } from "@/entities/user/types";
import { Header } from "../header";

interface ShellLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export const ShellLayout = ({ children, role }: ShellLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <Header role={role} />

      <main className="flex-1 w-full max-w-7xl mx-auto py-8">{children}</main>
    </div>
  );
};
