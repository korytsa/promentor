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

declare module "coachingApp/Widget" {
  import type { ComponentType } from "react";
  const CoachingWidget: ComponentType;
  export default CoachingWidget;
}
