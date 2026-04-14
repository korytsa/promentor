ALTER TABLE "room_members" ADD COLUMN "lastReadAt" TIMESTAMP(3);

UPDATE "room_members" SET "lastReadAt" = "joinedAt" WHERE "lastReadAt" IS NULL;
