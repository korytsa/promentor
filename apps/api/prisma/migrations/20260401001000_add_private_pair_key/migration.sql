ALTER TABLE "chat_rooms"
ADD COLUMN "privatePairKey" TEXT;

CREATE UNIQUE INDEX "chat_rooms_privatePairKey_key"
ON "chat_rooms"("privatePairKey");
