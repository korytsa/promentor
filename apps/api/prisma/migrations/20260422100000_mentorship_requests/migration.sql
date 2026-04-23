CREATE TYPE "MentorshipRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TYPE "MentorAvailabilityTier" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

ALTER TABLE "User" ADD COLUMN "mentorAvailability" "MentorAvailabilityTier",
ADD COLUMN "mentorWeeklySessions" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "mentorship_requests" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "message" TEXT,
    "status" "MentorshipRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentorship_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mentorship_requests_mentorId_menteeId_key" ON "mentorship_requests"("mentorId", "menteeId");

CREATE INDEX "mentorship_requests_mentorId_status_idx" ON "mentorship_requests"("mentorId", "status");

CREATE INDEX "mentorship_requests_menteeId_idx" ON "mentorship_requests"("menteeId");

ALTER TABLE "mentorship_requests" ADD CONSTRAINT "mentorship_requests_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mentorship_requests" ADD CONSTRAINT "mentorship_requests_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
