ALTER TABLE "room_members" ADD COLUMN "last_read_at" TIMESTAMP(3);

UPDATE "room_members" SET "last_read_at" = "joined_at" WHERE "last_read_at" IS NULL;
