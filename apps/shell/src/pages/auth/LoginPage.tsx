import { Navigate, useParams } from "react-router-dom";
import { UserRole } from "@/entities/user/types";
import { AuthCard, LoginForm } from "@/features/auth";
import { LoginFormValues } from "@/features/auth/model/schema";
import { AppBackground } from "@/shared/ui";
import { getRoleFromParam } from "./lib/role";

interface LoginPageProps {
  onLogin: (role: UserRole, values: LoginFormValues) => void;
  onGoogleLogin: (role: UserRole) => void;
}

export const LoginPage = ({ onLogin, onGoogleLogin }: LoginPageProps) => {
  const { role } = useParams();
  const parsedRole = getRoleFromParam(role);

  if (!parsedRole) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppBackground contentClassName="min-h-screen flex items-center justify-center px-4 py-10">
      <AuthCard role={parsedRole} mode="login">
        <LoginForm
          onSubmit={(values) => onLogin(parsedRole, values)}
          onGoogleLogin={() => onGoogleLogin(parsedRole)}
        />
      </AuthCard>
    </AppBackground>
  );
};
