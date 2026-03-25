import { NavLink } from "react-router-dom";
import { NavItem } from "@/entities/user/types";
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
          ? "bg-blue-600/20 text-blue-400"
          : "text-blue-500 bg-blue-500/10"
        : "text-slate-400 hover:text-white hover:bg-slate-800/50",
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
