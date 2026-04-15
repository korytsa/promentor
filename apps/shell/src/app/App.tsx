import { Route, Routes } from "react-router-dom";
import { DashboardPage } from "@/pages";
import { UnknownPathRedirect } from "./routing";
import { guestRoutes } from "./routing/config/guestRoutes";
import { remoteRoutes } from "./routing/config/remoteRoutes";
import { isChatRoute } from "./routing/lib/isChatRoute";
import { ChatRouteLayout } from "./routing/ui/ChatRouteLayout";
import { GuestRoute } from "./routing/ui/GuestRoute";
import { ProtectedRemoteRoute } from "./routing/ui/ProtectedRemoteRoute";
import { ProtectedRoute } from "./routing/ui/ProtectedRoute";

export function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {remoteRoutes.map(({ path, title, loadingText, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRemoteRoute title={title} loadingText={loadingText}>
              {isChatRoute(path) ? (
                <ChatRouteLayout>{element}</ChatRouteLayout>
              ) : (
                element
              )}
            </ProtectedRemoteRoute>
          }
        />
      ))}

      {guestRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<GuestRoute>{element}</GuestRoute>}
        />
      ))}
      <Route path="*" element={<UnknownPathRedirect />} />
    </Routes>
  );
}
