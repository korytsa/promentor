ALTER TABLE "chat_rooms"
ADD CONSTRAINT "chat_rooms_type_privatePairKey_check"
CHECK (
  ("type" = 'private' AND "privatePairKey" IS NOT NULL)
  OR
  ("type" = 'group' AND "privatePairKey" IS NULL)
);
