import { ReactNode } from "react";
import { AppBackground } from "@/shared/ui";
import { Header } from "../header";

interface ShellLayoutProps {
  children: ReactNode;
}

export const ShellLayout = ({ children }: ShellLayoutProps) => {
  return (
    <AppBackground>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 w-full max-w-7xl mx-auto lg:px-0 p-4 lg:py-8">
          {children}
        </main>
      </div>
    </AppBackground>
  );
};
