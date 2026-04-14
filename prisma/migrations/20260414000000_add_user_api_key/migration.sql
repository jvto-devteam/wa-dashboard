ALTER TABLE "User" ADD COLUMN "apiKey" TEXT;

-- Backfill existing users dengan key unik format XXX-YYY-ZZZ
UPDATE "User" SET "apiKey" =
  upper(substring(md5(random()::text), 1, 6)) || '-' ||
  upper(substring(md5(random()::text), 1, 6)) || '-' ||
  upper(substring(md5(random()::text), 1, 6))
WHERE "apiKey" IS NULL;

CREATE UNIQUE INDEX "User_apiKey_key" ON "User"("apiKey");
