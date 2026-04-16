import { lazy } from "react";

export const ChatEmptyPage = lazy(() => import("chatApp/ChatEmptyPage"));
export const ChatCreateGroupPage = lazy(
  () => import("chatApp/ChatCreateGroupPage"),
);
export const ChatConversationPage = lazy(
  () => import("chatApp/ChatConversationPage"),
);
export const ChatSidebar = lazy(() => import("chatApp/ChatSidebar"));
