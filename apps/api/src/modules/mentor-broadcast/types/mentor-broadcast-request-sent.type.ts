import type {
  MentorBroadcastScope,
  MentorBroadcastStatus,
} from "@prisma/client";

export type MentorBroadcastRequestSentItem = {
  id: string;
  scope: MentorBroadcastScope;
  teamId: string | null;
  menteeId: string | null;
  boardId: string | null;
  targetLabel: string;
  contextLine: string | null;
  body: string;
  status: MentorBroadcastStatus;
  createdAt: string;
  updatedAt: string;
};
