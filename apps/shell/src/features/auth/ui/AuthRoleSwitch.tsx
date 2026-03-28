import { Link } from "react-router-dom";
import { Typography } from "@promentorapp/ui-kit";
import { UserRole } from "@/entities/user/types";
import { AUTH_ROLES } from "../model/constants";
import { cn } from "@/shared/lib/utils";

interface AuthRoleSwitchProps {
  currentRole: UserRole;
  page: "login" | "register";
}

export const AuthRoleSwitch = ({ currentRole, page }: AuthRoleSwitchProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {AUTH_ROLES.map((item) => {
        const href = `/${page}/${item.role.toLowerCase()}`;
        const active = item.role === currentRole;

        return (
          <Link
            key={item.role}
            to={href}
            className={cn(
              "rounded-xl px-4 py-3 text-sm transition-all duration-300",
              active
                ? "border [border-color:var(--pm-accent-cyan-border)] [background-image:linear-gradient(to_bottom_right,var(--pm-accent-cyan-soft),var(--pm-accent-blue-soft))] text-[var(--pm-accent-cyan)] shadow-[0_10px_30px_rgba(14,165,233,0.25)]"
                : "border pm-border pm-text-muted hover:pm-text-secondary hover:bg-[var(--pm-surface-hover)]",
            )}
          >
            <Typography
              variantStyle="subtitle"
              className={cn(
                "font-bold uppercase tracking-wide",
                active ? "text-[var(--pm-accent-cyan)]" : "pm-text-secondary",
              )}
            >
              {item.title}
            </Typography>
            <Typography
              variantStyle="caption"
              className={cn(
                "mt-1 opacity-90",
                active ? "pm-text-secondary" : "pm-text-muted",
              )}
            >
              {item.description}
            </Typography>
          </Link>
        );
      })}
    </div>
  );
};
