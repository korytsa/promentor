CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "User_fullName_trgm_idx" ON "User" USING gin ("fullName" gin_trgm_ops);

CREATE INDEX "User_jobTitle_trgm_idx" ON "User" USING gin ("jobTitle" gin_trgm_ops);
