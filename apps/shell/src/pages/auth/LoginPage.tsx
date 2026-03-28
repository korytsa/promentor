import { AuthCard, LoginForm } from "@/features/auth";
import { AuthRolePageShell } from "./AuthRolePageShell";

export const LoginPage = () => (
  <AuthRolePageShell>
    {(role) => (
      <AuthCard role={role} mode="login">
        <LoginForm key={role} role={role} />
      </AuthCard>
    )}
  </AuthRolePageShell>
);
