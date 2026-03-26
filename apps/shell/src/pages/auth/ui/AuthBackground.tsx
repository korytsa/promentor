import { ReactNode } from "react";

interface AuthBackgroundProps {
  children: ReactNode;
}

export const AuthBackground = ({ children }: AuthBackgroundProps) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030712]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.24),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_50%_85%,rgba(14,165,233,0.16),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,25,47,0.28),rgba(2,6,23,0.92))]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-size:36px_36px] [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
};
