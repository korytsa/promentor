import { Route, Routes } from "react-router-dom";
import { Suspense, lazy, type ReactNode } from "react";
import { DashboardPage, LoginPage, RegisterPage } from "@/pages";
import { RemoteErrorBoundary } from "@/shared/ui";
import { RequireAuth, RequireGuest, UnknownPathRedirect } from "./routing";

const ChatEmptyPage = lazy(() => import("chatApp/ChatEmptyPage"));
const ChatCreateGroupPage = lazy(() => import("chatApp/ChatCreateGroupPage"));
const ChatProfilePage = lazy(() => import("chatApp/ChatProfilePage"));
const ChatConversationPage = lazy(() => import("chatApp/ChatConversationPage"));
const ChatSidebar = lazy(() => import("chatApp/ChatSidebar"));

const TeamsPage = lazy(() => import("coachingApp/TeamsPage"));
const BoardsPage = lazy(() => import("coachingApp/BoardsPage"));
const WorkoutPlansPage = lazy(() => import("coachingApp/WorkoutPlansPage"));
const ExploreTeamsPage = lazy(() => import("coachingApp/ExploreTeamsPage"));
const MentorsPage = lazy(() => import("coachingApp/MentorsPage"));
const SuggestionPage = lazy(() => import("coachingApp/SuggestionPage"));
const RequestsPage = lazy(() => import("coachingApp/RequestsPage"));
const ProfilePage = lazy(() => import("coachingApp/ProfilePage"));

type ProtectedRemoteRouteProps = {
  title: string;
  loadingText: string;
  children: ReactNode;
};

type RemoteRouteConfig = {
  path: string;
  title: string;
  loadingText: string;
  element: ReactNode;
};

type GuestRouteConfig = {
  path: string;
  element: ReactNode;
};

function isChatRoute(path: string) {
  return path === "/chat" || path.startsWith("/chat/");
}

const remoteRoutes: RemoteRouteConfig[] = [
  {
    path: "/chat",
    title: "Chat",
    loadingText: "Loading chat...",
    element: <ChatEmptyPage />,
  },
  {
    path: "/chat/create-group",
    title: "Create Group",
    loadingText: "Loading create group...",
    element: <ChatCreateGroupPage />,
  },
  {
    path: "/chat/profile",
    title: "Profile",
    loadingText: "Loading profile...",
    element: <ChatProfilePage />,
  },
  {
    path: "/chat/profile/:slug",
    title: "Profile",
    loadingText: "Loading profile...",
    element: <ChatProfilePage />,
  },
  {
    path: "/chat/:chatId",
    title: "Chat",
    loadingText: "Loading chat...",
    element: <ChatConversationPage />,
  },
  {
    path: "/teams",
    title: "Teams",
    loadingText: "Loading teams...",
    element: <TeamsPage />,
  },
  {
    path: "/boards",
    title: "Boards",
    loadingText: "Loading boards...",
    element: <BoardsPage />,
  },
  {
    path: "/workout-plans",
    title: "Workout Plans",
    loadingText: "Loading workout plans...",
    element: <WorkoutPlansPage />,
  },
  {
    path: "/requests",
    title: "Requests",
    loadingText: "Loading requests...",
    element: <RequestsPage />,
  },
  {
    path: "/profile",
    title: "Profile",
    loadingText: "Loading profile...",
    element: <ProfilePage />,
  },
  {
    path: "/explore-teams",
    title: "Explore Teams",
    loadingText: "Loading explore teams...",
    element: <ExploreTeamsPage />,
  },
  {
    path: "/mentors",
    title: "Mentors",
    loadingText: "Loading mentors...",
    element: <MentorsPage />,
  },
  {
    path: "/suggestion",
    title: "Suggestion",
    loadingText: "Loading suggestion...",
    element: <SuggestionPage />,
  },
];

const guestRoutes: GuestRouteConfig[] = [
  {
    path: "/login/:role",
    element: <LoginPage />,
  },
  {
    path: "/register/:role",
    element: <RegisterPage />,
  },
];

function ProtectedRoute({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

function GuestRoute({ children }: { children: ReactNode }) {
  return <RequireGuest>{children}</RequireGuest>;
}

function ProtectedRemoteRoute({
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
                <div className="flex flex-1 w-full h-[calc(100vh-110px)] gap-2 flex-row">
                  <ChatSidebar />
                  {element}
                </div>
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
