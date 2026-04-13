-- Add authState column to WaNumber for cross-Lambda Baileys session restore
ALTER TABLE "WaNumber" ADD COLUMN "authState" JSONB;
