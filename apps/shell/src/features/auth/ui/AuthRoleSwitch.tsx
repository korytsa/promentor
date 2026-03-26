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
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/15 bg-slate-900/65 p-2">
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
                ? "bg-gradient-to-br from-cyan-400/25 to-blue-500/20 text-cyan-100 border border-cyan-300/40 shadow-[0_10px_30px_rgba(14,165,233,0.25)]"
                : "text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/10",
            )}
          >
            <Typography
              variantStyle="subtitle"
              className="font-bold uppercase tracking-wide"
            >
              {item.title}
            </Typography>
            <Typography variantStyle="caption" className="mt-1 opacity-90">
              {item.description}
            </Typography>
          </Link>
        );
      })}
    </div>
  );
};
