import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@promentorapp/ui-kit";
import {
  AUTH_ROLES,
  getAuthRoute,
  getOppositeAuthMode,
  type AuthMode,
  type UserRole,
} from "@/entities/user";
import { cn } from "@/shared/lib/utils";

interface AuthCardProps {
  role: UserRole;
  mode: AuthMode;
  children: ReactNode;
}

export const AuthCard = ({ role, mode, children }: AuthCardProps) => {
  const oppositeAction = getOppositeAuthMode(mode);
  const oppositeLabel =
    mode === "login" ? "Create account" : "I already have an account";

  return (
    <section className="w-full max-w-xl rounded-xl border border-[var(--pm-border)] p-7 shadow-[0_30px_100px_rgba(6,182,212,0.2)] md:p-8">
      <Typography
        variantStyle="eyebrow"
        className="text-[var(--pm-accent-cyan)]"
      >
        PROMENTOR
      </Typography>
      <Typography
        variantStyle="title"
        className="mt-3 text-3xl pm-text-primary"
      >
        {mode === "login" ? "Welcome back" : "Create your account"}
      </Typography>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {AUTH_ROLES.map((item) => {
          const active = item.role === role;
          return (
            <Link
              key={item.role}
              to={getAuthRoute(mode, item.role)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-lg px-4 py-3 text-sm transition-all duration-300",
                active
                  ? "bg-gradient-to-br from-cyan-400/25 to-blue-500/20 text-cyan-100 border border-cyan-300/40 shadow-[0_10px_30px_rgba(14,165,233,0.25)]"
                  : "text-slate-400 border border-white/15 hover:text-slate-200 hover:bg-white/10",
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

      <div className="mt-6">{children}</div>

      <div className="mt-7">
        <Typography variantStyle="muted" className="text-sm pm-text-muted">
          {mode === "login" ? "New here?" : "Already registered?"}{" "}
          <Link
            to={`/${oppositeAction}/${role.toLowerCase()}`}
            className="font-semibold text-[var(--pm-accent-cyan)] hover:opacity-80"
          >
            {oppositeLabel}
          </Link>
        </Typography>
      </div>
    </section>
  );
};
