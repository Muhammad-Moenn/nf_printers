-- Additive migration: legacy quantity/amount strings remain available while
-- the application moves to structured pricing data.
CREATE TYPE "PricingSource" AS ENUM ('RULE_BASED', 'ML_MODEL', 'MANUAL');
CREATE TYPE "PricingConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "PricingStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'OVERRIDDEN');

ALTER TABLE "Order"
ADD COLUMN "quantityValue" INTEGER,
ADD COLUMN "estimatedAmount" DECIMAL(12,2),
ADD COLUMN "finalAmount" DECIMAL(12,2),
ADD COLUMN "pricingSource" "PricingSource",
ADD COLUMN "pricingConfidence" "PricingConfidence",
ADD COLUMN "pricingStatus" "PricingStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
ADD COLUMN "pricingBreakdown" JSONB,
ADD COLUMN "pricingFeatures" JSONB,
ADD COLUMN "pricingModelVersion" TEXT,
ADD COLUMN "adminAdjusted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "adjustmentReason" TEXT,
ADD COLUMN "priceReviewedById" TEXT,
ADD COLUMN "priceEstimatedAt" TIMESTAMP(3),
ADD COLUMN "priceReviewedAt" TIMESTAMP(3);

-- Treat valid legacy prices as previously approved manual quotes. Invalid
-- legacy values remain null so they can be reviewed without failing migration.
UPDATE "Order"
SET
  "quantityValue" = CASE
    WHEN BTRIM("quantity") ~ '^[0-9]+$' THEN BTRIM("quantity")::INTEGER
    ELSE NULL
  END,
  "finalAmount" = CASE
    WHEN regexp_replace("amount", '[^0-9.]', '', 'g') ~ '^[0-9]+(\.[0-9]+)?$'
      THEN regexp_replace("amount", '[^0-9.]', '', 'g')::DECIMAL(12,2)
    ELSE NULL
  END,
  "pricingSource" = CASE
    WHEN regexp_replace("amount", '[^0-9.]', '', 'g') ~ '^[0-9]+(\.[0-9]+)?$'
      THEN 'MANUAL'::"PricingSource"
    ELSE NULL
  END,
  "pricingStatus" = CASE
    WHEN regexp_replace("amount", '[^0-9.]', '', 'g') ~ '^[0-9]+(\.[0-9]+)?$'
      THEN 'APPROVED'::"PricingStatus"
    ELSE 'PENDING_REVIEW'::"PricingStatus"
  END,
  "priceReviewedAt" = CASE
    WHEN regexp_replace("amount", '[^0-9.]', '', 'g') ~ '^[0-9]+(\.[0-9]+)?$'
      THEN "updatedAt"
    ELSE NULL
  END;
