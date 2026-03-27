import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Component, type ReactNode, Suspense, lazy, useState } from "react";
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

const ChatWidget = lazy(() => import("chatApp/Widget"));
const CoachingWidget = lazy(() => import("coachingApp/Widget"));

class RemoteErrorBoundary extends Component<
  { children: ReactNode; title: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section style={{ padding: 16 }}>
          <h2>{this.props.title}</h2>
          <p>Remote is unavailable right now. Try again later.</p>
        </section>
      );
    }

    return this.props.children;
  }
}

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

  const chatRouteElement = isAuthenticated ? (
    <ShellLayout role={role}>
      <RemoteErrorBoundary title="Chat">
        <Suspense fallback={<div style={{ padding: 16 }}>Loading chat...</div>}>
          <ChatWidget />
        </Suspense>
      </RemoteErrorBoundary>
    </ShellLayout>
  ) : (
    <Navigate to={AUTH_REDIRECT_PATH} replace />
  );

  const coachingRouteElement = isAuthenticated ? (
    <ShellLayout role={role}>
      <RemoteErrorBoundary title="Coaching">
        <Suspense
          fallback={<div style={{ padding: 16 }}>Loading coaching...</div>}
        >
          <CoachingWidget />
        </Suspense>
      </RemoteErrorBoundary>
    </ShellLayout>
  ) : (
    <Navigate to={AUTH_REDIRECT_PATH} replace />
  );

  return (
    <Routes>
      <Route path="/" element={homeRouteElement} />
      <Route path="/chat" element={chatRouteElement} />
      <Route path="/coaching" element={coachingRouteElement} />
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
