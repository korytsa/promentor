import { Navigate, useParams } from "react-router-dom";
import { UserRole } from "@/entities/user/types";
import { AuthCard, LoginForm } from "@/features/auth";
import { LoginFormValues } from "@/features/auth/model/schema";
import { getRoleFromParam } from "./lib/role";
import { AuthBackground } from "./ui/AuthBackground";

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
    <AuthBackground>
      <AuthCard role={parsedRole} mode="login">
        <LoginForm
          onSubmit={(values) => onLogin(parsedRole, values)}
          onGoogleLogin={() => onGoogleLogin(parsedRole)}
        />
      </AuthCard>
    </AuthBackground>
  );
};
