CREATE TYPE "MentorBroadcastScope" AS ENUM ('TEAM', 'INTERN', 'BOARD');

CREATE TYPE "MentorBroadcastStatus" AS ENUM ('DELIVERED', 'CANCELLED');

CREATE TABLE "mentor_broadcast_requests" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "scope" "MentorBroadcastScope" NOT NULL,
    "teamId" TEXT,
    "targetLabel" TEXT NOT NULL,
    "contextLine" TEXT,
    "body" TEXT NOT NULL,
    "status" "MentorBroadcastStatus" NOT NULL DEFAULT 'DELIVERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_broadcast_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mentor_broadcast_requests_mentorId_status_createdAt_idx" ON "mentor_broadcast_requests"("mentorId", "status", "createdAt");

ALTER TABLE "mentor_broadcast_requests" ADD CONSTRAINT "mentor_broadcast_requests_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mentor_broadcast_requests" ADD CONSTRAINT "mentor_broadcast_requests_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "coaching_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
