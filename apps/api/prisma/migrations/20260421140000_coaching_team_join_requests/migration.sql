CREATE TYPE "CoachingTeamJoinRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE "coaching_team_join_requests" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "message" TEXT,
    "status" "CoachingTeamJoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaching_team_join_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "coaching_team_join_requests_teamId_requesterId_key" ON "coaching_team_join_requests"("teamId", "requesterId");

CREATE INDEX "coaching_team_join_requests_teamId_status_idx" ON "coaching_team_join_requests"("teamId", "status");

CREATE INDEX "coaching_team_join_requests_requesterId_idx" ON "coaching_team_join_requests"("requesterId");

ALTER TABLE "coaching_team_join_requests" ADD CONSTRAINT "coaching_team_join_requests_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "coaching_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coaching_team_join_requests" ADD CONSTRAINT "coaching_team_join_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
