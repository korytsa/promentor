import { ReactNode } from "react";
import { Header } from "../header";

interface ShellLayoutProps {
  children: ReactNode;
}

export const ShellLayout = ({ children }: ShellLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto py-8">{children}</main>
    </div>
  );
};
