import type { CoachingTeamJoinRequestStatus } from "@prisma/client";

export type TeamJoinRequestInboxItemResponse = {
  id: string;
  teamId: string;
  teamName: string;
  requesterId: string;
  requesterName: string;
  requesterAvatarUrl: string | null;
  message: string | null;
  status: CoachingTeamJoinRequestStatus;
  createdAt: string;
  updatedAt: string;
};
