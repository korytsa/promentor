import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Component, type ReactNode, Suspense, lazy, useEffect } from "react";
import { UserRole } from "@/entities/user/types";
import { ShellLayout } from "@/widgets/layout";
import { DashboardPage, LoginPage, RegisterPage } from "@/pages";
import { useAuthStore } from "@/features/auth";
import {
  LoginFormValues,
  RegisterFormValues,
} from "@/features/auth/model/schema";

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

export function App() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitializing, initializeAuth, authorize } =
    useAuthStore();

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  const role: UserRole = user?.role ?? "REGULAR_USER";

  const handleAuthWithValues = (
    nextRole: UserRole,
    values: LoginFormValues | RegisterFormValues,
  ) => {
    void authorize(nextRole, values).then(() => {
      navigate("/", { replace: true });
    });
  };

  const handleGoogleAuth = (nextRole: UserRole) => {
    void authorize(nextRole).then(() => {
      navigate("/", { replace: true });
    });
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

  if (isInitializing) {
    return <div style={{ padding: 16 }}>Initializing auth...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={homeRouteElement} />
      <Route path="/chat" element={chatRouteElement} />
      <Route path="/coaching" element={coachingRouteElement} />
      <Route
        path="/login/:role"
        element={
          <LoginPage
            onLogin={handleAuthWithValues}
            onGoogleLogin={handleGoogleAuth}
          />
        }
      />
      <Route
        path="/register/:role"
        element={
          <RegisterPage
            onRegister={handleAuthWithValues}
            onGoogleRegister={handleGoogleAuth}
          />
        }
      />
      <Route path="*" element={<Navigate to={AUTH_REDIRECT_PATH} replace />} />
    </Routes>
  );
}
