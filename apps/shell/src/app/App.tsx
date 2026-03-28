import { Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { DashboardPage, LoginPage, RegisterPage } from "@/pages";
import { RemoteErrorBoundary } from "@/shared/ui";
import { RequireAuth, RequireGuest, UnknownPathRedirect } from "./routing";

const ChatWidget = lazy(() => import("chatApp/Widget"));
const CoachingWidget = lazy(() => import("coachingApp/Widget"));

export function App() {
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
