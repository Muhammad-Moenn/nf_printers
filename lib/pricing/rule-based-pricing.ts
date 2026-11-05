import { normalizePricingRequest } from "@/lib/pricing/normalize-order";
import { pricingResultSchema, type PricingResult } from "@/lib/pricing/types";

const serviceRates: Record<string, { base: number; unit: number }> = {
  "Register Printing": { base: 700, unit: 38 },
  "Book Printing": { base: 900, unit: 45 },
  "Title & Cover Printing": { base: 600, unit: 30 },
  "File & Document Printing": { base: 250, unit: 18 },
  "Book Binding": { base: 300, unit: 22 },
  "Bulk Printing": { base: 1200, unit: 28 },
  "Poster Printing": { base: 450, unit: 85 },
  "Invoice & Receipt Books": { base: 650, unit: 32 },
  "Sticker & Label Printing": { base: 500, unit: 26 },
  "Calendar Printing": { base: 850, unit: 42 },
  "Lamination Services": { base: 200, unit: 20 },
  "Cutting & Trimming": { base: 150, unit: 10 },
};

const paperTypeMultiplier: Record<string, number> = {
  "Offset Paper": 1,
  "Art Paper (Gloss)": 1.25,
  "Art Paper (Matt)": 1.22,
  "Bond Paper": 1.12,
  "Card Stock": 1.35,
  "Art Card": 1.4,
  "Bristol Card": 1.3,
  "Ivory Card": 1.32,
  "Kraft Paper": 1.18,
  "Texture Paper": 1.45,
  "Duplex Board": 1.55,
  "Blech Card": 1.4,
  "Grey Board": 1.5,
};

const finishingUnitRates: Record<string, number> = {
  Lamination: 12,
  Cutting: 5,
  Folding: 6,
  Binding: 20,
  "UV Spot": 18,
};

function roundToNearestTen(value: number) {
  return Math.max(0, Math.round(value / 10) * 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateRuleBasedPrice(input: unknown): PricingResult {
  const features = normalizePricingRequest(input);
  const rate = serviceRates[features.service] ?? { base: 500, unit: 30 };
  const paperMultiplier = paperTypeMultiplier[features.paperType] ?? 1.15;
  const gsmMultiplier = features.gsm ? 1 + Math.max(features.gsm - 52, 0) / 300 : 1;
  const colorMultiplier = features.isColorPrint ? 1.25 : 1;
  const sidesMultiplier = features.isDoubleSided ? 1.18 : 1;
  const customSizeMultiplier = features.isCustomSize ? 1.12 : 1;
  const urgencyMultiplier = features.hasUrgency ? 1.2 : 1;
  const reorderDiscount = features.isReorder ? 0.95 : 1;

  const baseAndQuantity = rate.base + rate.unit * features.quantity;
  const finishingAmount = features.finishingOptions.reduce(
    (sum, option) => sum + (finishingUnitRates[option] ?? 8) * features.quantity,
    0
  );
  const adjustedAmount =
    baseAndQuantity *
      paperMultiplier *
      gsmMultiplier *
      colorMultiplier *
      sidesMultiplier *
      customSizeMultiplier *
      urgencyMultiplier *
      reorderDiscount +
    finishingAmount;

  const predictedAmount = roundToNearestTen(adjustedAmount);

  return pricingResultSchema.parse({
    predictedAmount,
    formattedAmount: formatCurrency(predictedAmount),
    confidence: features.service && features.quantity > 0 ? "medium" : "low",
    pricingSource: "rule_based",
    features,
    breakdown: [
      { label: "Base and quantity", amount: roundToNearestTen(baseAndQuantity) },
      { label: "Finishing", amount: roundToNearestTen(finishingAmount) },
      { label: "Paper/GSM/color/sides adjustment", amount: roundToNearestTen(predictedAmount - baseAndQuantity - finishingAmount) },
    ],
  });
}
