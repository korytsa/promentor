import { NavLink, useLocation } from "react-router-dom";
import type { NavItem } from "@/entities/user/types";
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
  const location = useLocation();

  const getStyle = (item: NavItem, isActive: boolean) =>
    cn(
      isMobile
        ? "px-4 py-3 rounded-xl text-sm font-bold transition-all"
        : "px-4 py-2 font-semibold text-sm tracking-wider uppercase transition-all duration-300 rounded-lg",
      isActive ||
        Boolean(
          item.matchPrefix && location.pathname.startsWith(item.matchPrefix),
        )
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
          className={({ isActive }) => getStyle(item, isActive)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};
