import { ReactNode } from "react";
import { Header } from "../header";

interface ShellLayoutProps {
  children: ReactNode;
}

export const ShellLayout = ({ children }: ShellLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen transition-colors bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#f1f5f9_45%,_#e2e8f0_100%)] dark:bg-slate-900">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto py-8">{children}</main>
    </div>
  );
};
