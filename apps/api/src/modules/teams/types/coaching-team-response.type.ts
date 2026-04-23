import { CoachingTeamStatus, Prisma } from "@prisma/client";

const TEAM_MEMBER_PREVIEW = 3;

export const COACHING_TEAM_LIST_INCLUDE = {
  members: {
    take: TEAM_MEMBER_PREVIEW,
    orderBy: { joinedAt: "asc" as const },
    select: {
      user: {
        select: { avatarUrl: true, fullName: true },
      },
    },
  },
  _count: {
    select: { members: true },
  },
} as const;

export type CoachingTeamListRecord = Prisma.CoachingTeamGetPayload<{
  include: typeof COACHING_TEAM_LIST_INCLUDE;
}>;

export type CoachingTeamListItemResponse = {
  id: string;
  name: string;
  status: CoachingTeamStatus;
  membersCount: number;
  memberAvatarUrls: (string | null)[];
  memberFirstNames: string[];
};

function firstWordFromFullName(fullName: string): string {
  const t = fullName.trim();
  if (!t) {
    return "";
  }
  return t.split(/\s+/)[0] ?? "";
}

export function toCoachingTeamListItem(
  row: CoachingTeamListRecord,
): CoachingTeamListItemResponse {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    membersCount: row._count.members,
    memberAvatarUrls: row.members.map((m) => m.user.avatarUrl),
    memberFirstNames: row.members.map((m) =>
      firstWordFromFullName(m.user.fullName),
    ),
  };
}

export type CoachingTeamMemberItemResponse = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
};

export type CoachingTeamDetailResponse = {
  id: string;
  name: string;
  status: CoachingTeamStatus;
  members: CoachingTeamMemberItemResponse[];
};
