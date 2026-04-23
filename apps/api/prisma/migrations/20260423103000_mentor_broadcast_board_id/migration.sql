ALTER TABLE "mentor_broadcast_requests" ADD COLUMN "boardId" TEXT;

CREATE INDEX "mentor_broadcast_requests_boardId_idx" ON "mentor_broadcast_requests"("boardId");

ALTER TABLE "mentor_broadcast_requests" ADD CONSTRAINT "mentor_broadcast_requests_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "user_boards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
