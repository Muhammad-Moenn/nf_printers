import {
  pricingFeaturesSchema,
  pricingRequestSchema,
  type PricingFeatures,
  type PricingRequest,
} from "@/lib/pricing/types";

function parseNumber(value: string | number | undefined) {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function includesAny(value: string, terms: string[]) {
  const normalized = value.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

export function normalizePricingRequest(input: unknown): PricingFeatures {
  const order: PricingRequest = pricingRequestSchema.parse(input);
  const requirements = order.requirements ?? "";
  const size = order.size ?? "";
  const colorMode = order.colorMode ?? "";
  const sides = order.sides ?? "";

  return pricingFeaturesSchema.parse({
    product: order.product ?? "",
    service: order.service,
    quantity: Math.max(1, parseNumber(order.quantity)),
    paperType: order.paperType ?? "",
    size,
    gsm: parseNumber(order.gsm),
    colorMode,
    sides,
    finishingOptions: order.finishingOptions ?? [],
    finishingOptionsCount: order.finishingOptions?.length ?? 0,
    isDoubleSided: includesAny(sides, ["double", "two copies"]),
    isColorPrint: includesAny(colorMode, ["color", "cmyk", "four", "two"]),
    isCustomSize: includesAny(size, ["custom"]) || /^\d+\s*[x×]\s*\d+$/i.test(size),
    hasUrgency: includesAny(requirements, [
      "urgent",
      "asap",
      "quick",
      "today",
      "tomorrow",
      "fast",
      "jaldi",
    ]),
    hasSpecialInstructions: requirements.trim().length > 20,
    isReorder: order.isReorder ?? false,
  });
}
