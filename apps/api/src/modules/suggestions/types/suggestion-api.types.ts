import type { SuggestionPriority, SuggestionTargetScope } from "@prisma/client";

export type SuggestionMentorTargetRow = { id: string; label: string };
export type SuggestionBoardTargetRow = {
  id: string;
  name: string;
  mentorId: string;
};

export type UserSuggestionSentItem = {
  id: string;
  scope: SuggestionTargetScope;
  recipientMentorId: string;
  teamId: string | null;
  boardId: string | null;
  teamName: string | null;
  boardName: string | null;
  targetMentorName: string | null;
  title: string;
  detail: string;
  priority: SuggestionPriority;
  createdAt: string;
  updatedAt: string;
};

export type UserSuggestionInboxItem = {
  id: string;
  scope: SuggestionTargetScope;
  title: string;
  detail: string;
  priority: SuggestionPriority;
  sender: { id: string; fullName: string; avatarUrl: string | null };
  teamName: string | null;
  boardName: string | null;
  createdAt: string;
  updatedAt: string;
};
