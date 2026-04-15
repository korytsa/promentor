import { Suspense, type ReactNode } from "react";
import { RemoteErrorBoundary } from "@/shared/ui";
import { ProtectedRoute } from "./ProtectedRoute";

type ProtectedRemoteRouteProps = {
  title: string;
  loadingText: string;
  children: ReactNode;
};

export function ProtectedRemoteRoute({
  title,
  loadingText,
  children,
}: ProtectedRemoteRouteProps) {
  return (
    <ProtectedRoute>
      <RemoteErrorBoundary title={title}>
        <Suspense fallback={<div>{loadingText}</div>}>{children}</Suspense>
      </RemoteErrorBoundary>
    </ProtectedRoute>
  );
}
