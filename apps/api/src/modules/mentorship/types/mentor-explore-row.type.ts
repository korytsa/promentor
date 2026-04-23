import type { MentorshipRequestStatus } from "@prisma/client";

export type MentorExploreRequestStatus = MentorshipRequestStatus | "NONE";

export type MentorExploreRowResponse = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  jobTitle: string | null;
  availabilityLabel: "High" | "Medium" | "Low";
  sessionsThisWeek: number;
  linkedTeams: string[];
  requestStatus: MentorExploreRequestStatus;
  mentorshipRequestId: string | null;
};
