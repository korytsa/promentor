ALTER TABLE "mentor_broadcast_requests" ADD COLUMN "menteeId" TEXT;

CREATE INDEX "mentor_broadcast_requests_menteeId_idx" ON "mentor_broadcast_requests"("menteeId");

ALTER TABLE "mentor_broadcast_requests" ADD CONSTRAINT "mentor_broadcast_requests_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
