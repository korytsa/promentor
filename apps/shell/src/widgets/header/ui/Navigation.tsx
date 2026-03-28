import { NavLink } from "react-router-dom";
import type { NavItem } from "@/features/navigation-by-role";
import { cn } from "@/shared/lib/utils";

interface NavigationProps {
  items: NavItem[];
  className?: string;
  onItemClick?: () => void;
  isMobile?: boolean;
}

export const Navigation = ({
  items,
  className,
  onItemClick,
  isMobile,
}: NavigationProps) => {
  const getStyle = ({ isActive }: { isActive: boolean }) =>
    cn(
      isMobile
        ? "px-4 py-3 rounded-xl text-sm font-bold transition-all"
        : "px-4 py-2 font-semibold text-sm tracking-wider uppercase transition-all duration-300 rounded-lg",
      isActive
        ? isMobile
          ? "text-[var(--pm-accent-blue)] [background-color:var(--pm-accent-blue-soft)]"
          : "text-[var(--pm-accent-blue)] [background-color:var(--pm-accent-blue-soft)]"
        : "pm-text-muted hover:pm-text-primary hover:bg-[var(--pm-surface-hover)]",
    );

  return (
    <nav className={className}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onItemClick}
          className={getStyle}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};
