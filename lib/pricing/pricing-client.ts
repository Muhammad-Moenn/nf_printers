import { calculateRuleBasedPrice } from "@/lib/pricing/rule-based-pricing";
import { pricingResultSchema, type PricingResult } from "@/lib/pricing/types";

export async function predictPrice(input: unknown): Promise<PricingResult> {
  const modelUrl = process.env.PRICING_MODEL_URL;

  if (modelUrl) {
    try {
      const response = await fetch(modelUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        return pricingResultSchema.parse(await response.json());
      }
    } catch (error) {
      console.error("Pricing model service failed, using rule engine:", error);
    }
  }

  return calculateRuleBasedPrice(input);
}
