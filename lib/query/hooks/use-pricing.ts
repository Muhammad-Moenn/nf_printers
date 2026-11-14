"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { predictPricing, type PricingPrediction } from "@/lib/data/pricing";
import { queryKeys } from "@/lib/query/query-keys";

const PRICING_DEBOUNCE_MS = 350;
const PRICING_STALE_TIME = 5 * 60_000;

const pricingFields = [
  "service",
  "quantity",
  "paperType",
  "size",
  "gsm",
  "colorMode",
  "sides",
  "finishingOptions",
  "requirements",
] as const;

export function pricingSignature(draft: Record<string, unknown>) {
  return JSON.stringify(
    Object.fromEntries(
      pricingFields.map((field) => [field, draft[field] ?? null])
    )
  );
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function usePricingEstimate(
  draft: Record<string, unknown>,
  options?: { enabled?: boolean; debounceMs?: number }
) {
  const debounced = useDebouncedValue(
    draft,
    options?.debounceMs ?? PRICING_DEBOUNCE_MS
  );
  const enabled = (options?.enabled ?? true) && Boolean(debounced.service);
  const signature = enabled ? pricingSignature(debounced) : "idle";

  return useQuery<PricingPrediction>({
    queryKey: queryKeys.pricing.estimate(signature),
    queryFn: ({ signal }) => predictPricing(debounced, signal),
    enabled,
    staleTime: PRICING_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: false,
  });
}
