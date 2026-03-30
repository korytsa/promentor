import { AuthCard, RegisterForm } from "@/features/auth";
import { AuthRolePageShell } from "./AuthRolePageShell";

export const RegisterPage = () => (
  <AuthRolePageShell>
    {(role) => (
      <AuthCard role={role} mode="register">
        <RegisterForm key={role} role={role} />
      </AuthCard>
    )}
  </AuthRolePageShell>
);
