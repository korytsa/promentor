/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CHAT_REMOTE_URL?: string;
  readonly VITE_COACHING_REMOTE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "chatApp/ChatEmptyPage" {
  import type { ComponentType } from "react";
  const ChatEmptyPage: ComponentType;
  export default ChatEmptyPage;
}

declare module "chatApp/ChatConversationPage" {
  import type { ComponentType } from "react";
  const ChatConversationPage: ComponentType;
  export default ChatConversationPage;
}

declare module "chatApp/ChatCreateGroupPage" {
  import type { ComponentType } from "react";
  const ChatCreateGroupPage: ComponentType;
  export default ChatCreateGroupPage;
}

declare module "chatApp/ChatSidebar" {
  import type { ComponentType } from "react";
  const ChatSidebar: ComponentType;
  export default ChatSidebar;
}

declare module "coachingApp/TeamsPage" {
  import type { ComponentType } from "react";
  const TeamsPage: ComponentType;
  export default TeamsPage;
}

declare module "coachingApp/BoardsPage" {
  import type { ComponentType } from "react";
  const BoardsPage: ComponentType;
  export default BoardsPage;
}

declare module "coachingApp/WorkoutPlansPage" {
  import type { ComponentType } from "react";
  const WorkoutPlansPage: ComponentType;
  export default WorkoutPlansPage;
}

declare module "coachingApp/RequestsPage" {
  import type { ComponentType } from "react";
  const RequestsPage: ComponentType;
  export default RequestsPage;
}

declare module "coachingApp/ProfilePage" {
  import type { ComponentType } from "react";
  const ProfilePage: ComponentType;
  export default ProfilePage;
}

declare module "coachingApp/ExploreTeamsPage" {
  import type { ComponentType } from "react";
  const ExploreTeamsPage: ComponentType;
  export default ExploreTeamsPage;
}

declare module "coachingApp/MentorsPage" {
  import type { ComponentType } from "react";
  const MentorsPage: ComponentType;
  export default MentorsPage;
}

declare module "coachingApp/SuggestionPage" {
  import type { ComponentType } from "react";
  const SuggestionPage: ComponentType;
  export default SuggestionPage;
}
