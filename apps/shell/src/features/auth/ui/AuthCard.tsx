import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@promentorapp/ui-kit";
import { UserRole } from "@/entities/user/types";
import { getRoleContent } from "../model/constants";
import { AuthRoleSwitch } from "./AuthRoleSwitch";

interface AuthCardProps {
  role: UserRole;
  mode: "login" | "register";
  children: ReactNode;
}

export const AuthCard = ({ role, mode, children }: AuthCardProps) => {
  const roleContent = getRoleContent(role);
  const oppositeAction = mode === "login" ? "register" : "login";
  const oppositeLabel =
    mode === "login" ? "Create account" : "I already have an account";

  return (
    <section className="w-full max-w-xl rounded-3xl border border-[var(--pm-border)] p-7 shadow-[0_30px_100px_rgba(6,182,212,0.2)] md:p-8">
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
      <Typography variantStyle="body" className="mt-3 pm-text-secondary">
        Continue as{" "}
        <span className="font-semibold pm-text-primary">
          {roleContent.title}
        </span>{" "}
        - {roleContent.description}
      </Typography>

      <div className="mt-6">
        <AuthRoleSwitch currentRole={role} page={mode} />
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
