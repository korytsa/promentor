import type { ReactNode } from "react";
import type { UserRole } from "@/entities/user/types";
import {
  BoardsPage,
  ExploreTeamsPage,
  MentorsPage,
  ProfilePage,
  RequestsPage,
  SuggestionPage,
  TeamsPage,
} from "../remotes/coachingRemotes";
import {
  ChatConversationPage,
  ChatCreateGroupPage,
  ChatEmptyPage,
} from "../remotes/chatRemotes";

const BOTH_ROLES: UserRole[] = ["MENTOR", "REGULAR_USER"];
const MENTOR_ONLY: UserRole[] = ["MENTOR"];
const REGULAR_USER_ONLY: UserRole[] = ["REGULAR_USER"];

export type RemoteRouteConfig = {
  path: string;
  title: string;
  loadingText: string;
  element: ReactNode;
  allowedRoles: readonly UserRole[];
};

export const remoteRoutes: RemoteRouteConfig[] = [
  {
    path: "/chat",
    title: "Chat",
    loadingText: "Loading chat...",
    element: <ChatEmptyPage />,
    allowedRoles: BOTH_ROLES,
  },
  {
    path: "/chat/create-group",
    title: "Create Group",
    loadingText: "Loading create group...",
    element: <ChatCreateGroupPage />,
    allowedRoles: BOTH_ROLES,
  },
  {
    path: "/chat/:chatId",
    title: "Chat",
    loadingText: "Loading chat...",
    element: <ChatConversationPage />,
    allowedRoles: BOTH_ROLES,
  },
  {
    path: "/teams",
    title: "Teams",
    loadingText: "Loading teams...",
    element: <TeamsPage />,
    allowedRoles: MENTOR_ONLY,
  },
  {
    path: "/boards",
    title: "Boards",
    loadingText: "Loading boards...",
    element: <BoardsPage />,
    allowedRoles: BOTH_ROLES,
  },
  {
    path: "/requests/:direction",
    title: "Requests",
    loadingText: "Loading requests...",
    element: <RequestsPage />,
    allowedRoles: MENTOR_ONLY,
  },
  {
    path: "/profile",
    title: "Profile",
    loadingText: "Loading profile...",
    element: <ProfilePage />,
    allowedRoles: BOTH_ROLES,
  },
  {
    path: "/explore-teams",
    title: "Explore Teams",
    loadingText: "Loading explore teams...",
    element: <ExploreTeamsPage />,
    allowedRoles: REGULAR_USER_ONLY,
  },
  {
    path: "/mentors",
    title: "Mentors",
    loadingText: "Loading mentors...",
    element: <MentorsPage />,
    allowedRoles: REGULAR_USER_ONLY,
  },
  {
    path: "/suggestion",
    title: "Suggestion",
    loadingText: "Loading suggestion...",
    element: <SuggestionPage />,
    allowedRoles: REGULAR_USER_ONLY,
  },
];
