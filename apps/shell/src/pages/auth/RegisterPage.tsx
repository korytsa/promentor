import { Navigate, useParams } from "react-router-dom";
import { getRoleFromParam } from "@/entities/user";
import { AuthCard, RegisterForm } from "@/features/auth";
import { AppBackground } from "@/shared/ui";

export const RegisterPage = () => {
  const { role } = useParams();
  const parsedRole = getRoleFromParam(role);

  if (!parsedRole) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppBackground contentClassName="min-h-screen flex items-center justify-center px-4 py-10">
      <AuthCard role={parsedRole} mode="register">
        <RegisterForm key={parsedRole} role={parsedRole} />
      </AuthCard>
    </AppBackground>
  );
};
