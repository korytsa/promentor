CREATE TYPE "SuggestionTargetScope" AS ENUM ('TEAM', 'MENTOR', 'BOARD');
CREATE TYPE "SuggestionPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

CREATE TABLE "user_boards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_boards_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_boards_ownerId_idx" ON "user_boards"("ownerId");
CREATE INDEX "user_boards_mentorId_idx" ON "user_boards"("mentorId");

ALTER TABLE "user_boards" ADD CONSTRAINT "user_boards_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_boards" ADD CONSTRAINT "user_boards_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "user_suggestions" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "scope" "SuggestionTargetScope" NOT NULL,
    "recipientMentorId" TEXT NOT NULL,
    "teamId" TEXT,
    "boardId" TEXT,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "priority" "SuggestionPriority" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_suggestions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_suggestions_senderId_createdAt_idx" ON "user_suggestions"("senderId", "createdAt");
CREATE INDEX "user_suggestions_recipientMentorId_createdAt_idx" ON "user_suggestions"("recipientMentorId", "createdAt");
CREATE INDEX "user_suggestions_boardId_idx" ON "user_suggestions"("boardId");

ALTER TABLE "user_suggestions" ADD CONSTRAINT "user_suggestions_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_suggestions" ADD CONSTRAINT "user_suggestions_recipientMentorId_fkey" FOREIGN KEY ("recipientMentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_suggestions" ADD CONSTRAINT "user_suggestions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "coaching_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_suggestions" ADD CONSTRAINT "user_suggestions_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "user_boards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
