import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserRole } from "@/entities/user/types";
import { ShellLayout } from "@/widgets/layout";
import { DashboardPage, LoginPage, RegisterPage } from "@/pages";
import {
  LoginFormValues,
  RegisterFormValues,
} from "@/features/auth/model/schema";

const AUTH_SESSION_KEY = "pm_auth";
const ROLE_SESSION_KEY = "pm_role";
const AUTH_REDIRECT_PATH = "/login/mentor";

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

  const handleAuthWithValues = (
    nextRole: UserRole,
    values: LoginFormValues | RegisterFormValues,
  ) => {
    void values;
    authorize(nextRole);
  };

  const homeRouteElement = isAuthenticated ? (
    <ShellLayout role={role}>
      <DashboardPage role={role} />
    </ShellLayout>
  ) : (
    <Navigate to={AUTH_REDIRECT_PATH} replace />
  );

  return (
    <Routes>
      <Route path="/" element={homeRouteElement} />
      <Route
        path="/login/:role"
        element={
          <LoginPage onLogin={handleAuthWithValues} onGoogleLogin={authorize} />
        }
      />
      <Route
        path="/register/:role"
        element={
          <RegisterPage
            onRegister={handleAuthWithValues}
            onGoogleRegister={authorize}
          />
        }
      />
      <Route path="*" element={<Navigate to={AUTH_REDIRECT_PATH} replace />} />
    </Routes>
  );
}
