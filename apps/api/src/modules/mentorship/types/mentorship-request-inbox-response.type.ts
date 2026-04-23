import type { MentorshipRequestStatus } from "@prisma/client";

export type MentorshipRequestInboxItemResponse = {
  id: string;
  mentorId: string;
  menteeId: string;
  menteeName: string;
  menteeAvatarUrl: string | null;
  message: string | null;
  status: MentorshipRequestStatus;
  createdAt: string;
  updatedAt: string;
};
