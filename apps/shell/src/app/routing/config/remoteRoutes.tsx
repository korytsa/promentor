import type { ReactNode } from "react";
import {
  BoardsPage,
  ExploreTeamsPage,
  MentorsPage,
  ProfilePage,
  RequestsPage,
  SuggestionPage,
  TeamsPage,
  WorkoutPlansPage,
} from "../remotes/coachingRemotes";
import {
  ChatConversationPage,
  ChatCreateGroupPage,
  ChatEmptyPage,
} from "../remotes/chatRemotes";

export type RemoteRouteConfig = {
  path: string;
  title: string;
  loadingText: string;
  element: ReactNode;
};

export const remoteRoutes: RemoteRouteConfig[] = [
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
    path: "/requests/:direction",
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
