import { ReactNode } from "react";
import { Header } from "../header";
import { useAppTheme } from "@promentorapp/ui-kit";
import { cn } from "@/shared/lib/utils";

interface ShellLayoutProps {
  children: ReactNode;
}

export const ShellLayout = ({ children }: ShellLayoutProps) => {
  const { mode } = useAppTheme();

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen transition-colors",
        mode === "dark"
          ? "bg-slate-900"
          : "bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#f1f5f9_45%,_#e2e8f0_100%)]",
      )}
    >
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto py-8">{children}</main>
    </div>
  );
};
