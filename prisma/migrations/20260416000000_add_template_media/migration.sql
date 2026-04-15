-- Add media fields to Template
ALTER TABLE "Template" ADD COLUMN "mediaType" TEXT;
ALTER TABLE "Template" ADD COLUMN "mediaUrl" TEXT;
ALTER TABLE "Template" ADD COLUMN "mediaFilename" TEXT;
