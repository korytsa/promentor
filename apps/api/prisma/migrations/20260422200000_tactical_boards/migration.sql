CREATE TYPE "TacticalBoardSurface" AS ENUM ('HOCKEY', 'FOOTBALL');

CREATE TABLE "tactical_boards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "sessionDate" DATE NOT NULL,
    "boardType" "TacticalBoardSurface" NOT NULL,
    "objects" JSONB NOT NULL,
    "stroke" TEXT NOT NULL,
    "strokeWidth" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tactical_boards_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tactical_boards_teamId_updatedAt_idx" ON "tactical_boards"("teamId", "updatedAt");

CREATE INDEX "tactical_boards_createdById_idx" ON "tactical_boards"("createdById");

ALTER TABLE "tactical_boards" ADD CONSTRAINT "tactical_boards_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "coaching_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tactical_boards" ADD CONSTRAINT "tactical_boards_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
