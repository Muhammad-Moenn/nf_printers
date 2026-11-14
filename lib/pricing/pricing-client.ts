import { apiClient } from "@/lib/api/client";
import { calculateRuleBasedPrice } from "@/lib/pricing/rule-based-pricing";
import { pricingResultSchema, type PricingResult } from "@/lib/pricing/types";

export async function predictPrice(input: unknown): Promise<PricingResult> {
  const modelUrl = process.env.PRICING_MODEL_URL;

  if (modelUrl) {
    try {
      const result = await apiClient<PricingResult>(modelUrl, {
        method: "POST",
        body: input as Record<string, unknown>,
        timeout: 10_000,
        credentials: "omit",
        cache: "no-store",
      });

      return pricingResultSchema.parse(result);
    } catch (error) {
      console.error("Pricing model service failed, using rule engine:", error);
    }
  }

  return calculateRuleBasedPrice(input);
}
