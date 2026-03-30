import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface AppBackgroundProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const AppBackground = ({
  children,
  className,
  contentClassName,
}: AppBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-[var(--pm-bg)] pm-text-primary",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,var(--pm-bg-radial-1),transparent_34%),radial-gradient(circle_at_80%_20%,var(--pm-bg-radial-2),transparent_40%),radial-gradient(circle_at_50%_85%,var(--pm-bg-radial-3),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--pm-bg-linear-top),var(--pm-bg-linear-bottom))]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-size:36px_36px] [background-image:linear-gradient(to_right,var(--pm-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--pm-grid-line)_1px,transparent_1px)]" />

      <div className={cn("relative z-10 min-h-screen", contentClassName)}>
        {children}
      </div>
    </div>
  );
};
