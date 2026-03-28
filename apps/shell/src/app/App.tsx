import { Navigate, Route, Routes } from "react-router-dom";
import { Component, type ReactNode, Suspense, lazy } from "react";
import {
  AUTH_LOGIN_REDIRECT_PATH,
  PLACEHOLDER_NAV_PATHS,
} from "@/entities/user/model/constants";
import { DashboardPage, LoginPage, RegisterPage } from "@/pages";
import { useSessionQuery } from "@/features/auth/api";
import { RequireAuth, RequireGuest } from "./AuthRoutes";

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

function UnknownPathRedirect() {
  const { data: user } = useSessionQuery();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <Navigate to={AUTH_LOGIN_REDIRECT_PATH} replace />;
}

export function App() {
  const { isPending: isSessionPending } = useSessionQuery();

  if (isSessionPending) {
    return <div style={{ padding: 16 }}>Initializing auth...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/chat"
        element={
          <RequireAuth>
            <RemoteErrorBoundary title="Chat">
              <Suspense
                fallback={<div style={{ padding: 16 }}>Loading chat...</div>}
              >
                <ChatWidget />
              </Suspense>
            </RemoteErrorBoundary>
          </RequireAuth>
        }
      />
      <Route
        path="/coaching"
        element={
          <RequireAuth>
            <RemoteErrorBoundary title="Coaching">
              <Suspense
                fallback={
                  <div style={{ padding: 16 }}>Loading coaching...</div>
                }
              >
                <CoachingWidget />
              </Suspense>
            </RemoteErrorBoundary>
          </RequireAuth>
        }
      />
      {PLACEHOLDER_NAV_PATHS.map((path) => (
        <Route
          key={path}
          path={path}
          element={<RequireAuth>{null}</RequireAuth>}
        />
      ))}
      <Route
        path="/login/:role"
        element={
          <RequireGuest>
            <LoginPage />
          </RequireGuest>
        }
      />
      <Route
        path="/register/:role"
        element={
          <RequireGuest>
            <RegisterPage />
          </RequireGuest>
        }
      />
      <Route path="*" element={<UnknownPathRedirect />} />
    </Routes>
  );
}
