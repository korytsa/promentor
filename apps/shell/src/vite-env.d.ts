/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CHAT_REMOTE_URL?: string;
  readonly VITE_COACHING_REMOTE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "chatApp/Widget" {
  import type { ComponentType } from "react";
  const ChatWidget: ComponentType;
  export default ChatWidget;
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
