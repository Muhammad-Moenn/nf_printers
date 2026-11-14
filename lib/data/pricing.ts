import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type PricingPrediction = {
  formattedAmount: string;
  predictedAmount: number;
  [key: string]: unknown;
};

export function predictPricing(
  draft: Record<string, unknown>,
  signal?: AbortSignal
) {
  return apiClient<PricingPrediction>(apiEndpoints.pricing.predict, {
    method: "POST",
    body: draft,
    signal,
  });
}
