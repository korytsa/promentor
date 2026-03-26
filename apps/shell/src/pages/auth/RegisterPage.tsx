import { Navigate, useParams } from "react-router-dom";
import { UserRole } from "@/entities/user/types";
import { AuthCard, RegisterForm } from "@/features/auth";
import { RegisterFormValues } from "@/features/auth/model/schema";
import { getRoleFromParam } from "./lib/role";
import { AuthBackground } from "./ui/AuthBackground";

interface RegisterPageProps {
  onRegister: (role: UserRole, values: RegisterFormValues) => void;
  onGoogleRegister: (role: UserRole) => void;
}

export const RegisterPage = ({
  onRegister,
  onGoogleRegister,
}: RegisterPageProps) => {
  const { role } = useParams();
  const parsedRole = getRoleFromParam(role);

  if (!parsedRole) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthBackground>
      <AuthCard role={parsedRole} mode="register">
        <RegisterForm
          onSubmit={(values) => onRegister(parsedRole, values)}
          onGoogleRegister={() => onGoogleRegister(parsedRole)}
        />
      </AuthCard>
    </AuthBackground>
  );
};
