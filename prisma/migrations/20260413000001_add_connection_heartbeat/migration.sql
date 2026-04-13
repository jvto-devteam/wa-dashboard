-- Add connectionActiveAt for cross-Lambda connection heartbeat
ALTER TABLE "WaNumber" ADD COLUMN "connectionActiveAt" TIMESTAMP(3);
