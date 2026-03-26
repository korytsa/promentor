import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserRole } from "@/entities/user/types";
import { ShellLayout } from "@/widgets/layout";
import { LoginPage, RegisterPage } from "@/pages";
import {
  LoginFormValues,
  RegisterFormValues,
} from "@/features/auth/model/schema";

const AUTH_SESSION_KEY = "pm_auth";
const ROLE_SESSION_KEY = "pm_role";

const getStoredRole = (): UserRole => {
  return sessionStorage.getItem(ROLE_SESSION_KEY) === "MENTOR"
    ? "MENTOR"
    : "REGULAR_USER";
};

export function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem(AUTH_SESSION_KEY) === "1",
  );
  const [role, setRole] = useState<UserRole>(getStoredRole());

  const authorize = (nextRole: UserRole) => {
    sessionStorage.setItem(AUTH_SESSION_KEY, "1");
    sessionStorage.setItem(ROLE_SESSION_KEY, nextRole);
    setIsAuthenticated(true);
    setRole(nextRole);
    navigate("/", { replace: true });
  };

  const handleLogin = (nextRole: UserRole, values: LoginFormValues) => {
    void values;
    authorize(nextRole);
  };

  const handleRegister = (nextRole: UserRole, values: RegisterFormValues) => {
    void values;
    authorize(nextRole);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <ShellLayout role={role}>
              <div />
            </ShellLayout>
          ) : (
            <Navigate to="/login/mentor" replace />
          )
        }
      />
      <Route
        path="/login/:role"
        element={<LoginPage onLogin={handleLogin} onGoogleLogin={authorize} />}
      />
      <Route
        path="/register/:role"
        element={
          <RegisterPage
            onRegister={handleRegister}
            onGoogleRegister={authorize}
          />
        }
      />
      <Route path="*" element={<Navigate to="/login/mentor" replace />} />
    </Routes>
  );
}
