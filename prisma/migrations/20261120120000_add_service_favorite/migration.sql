ALTER TABLE "Service"
ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Service"
SET "isFavorite" = true
WHERE "isActive" = true;
