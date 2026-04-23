CREATE TYPE "CoachingTeamStatus" AS ENUM ('ACTIVE', 'PENDING');

CREATE TABLE "coaching_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CoachingTeamStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaching_teams_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coaching_team_members" (
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coaching_team_members_pkey" PRIMARY KEY ("teamId","userId")
);

CREATE INDEX "coaching_teams_createdById_idx" ON "coaching_teams"("createdById");
CREATE INDEX "coaching_team_members_userId_idx" ON "coaching_team_members"("userId");

ALTER TABLE "coaching_teams" ADD CONSTRAINT "coaching_teams_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coaching_team_members" ADD CONSTRAINT "coaching_team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "coaching_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coaching_team_members" ADD CONSTRAINT "coaching_team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
