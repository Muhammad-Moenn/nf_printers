import { z } from "zod";

export const pricingRequestSchema = z.object({
  product: z.string().max(200).optional().default(""),
  service: z.string().min(1, "Service is required").max(200),
  quantity: z
    .union([z.string().max(50), z.number().finite()])
    .optional()
    .default(0),
  paperType: z.string().max(100).optional().default(""),
  size: z.string().max(100).optional().default(""),
  gsm: z.string().max(50).optional().default(""),
  colorMode: z.string().max(50).optional().default(""),
  sides: z.string().max(50).optional().default(""),
  finishingOptions: z
    .array(z.string().max(100))
    .max(20)
    .optional()
    .default([]),
  requirements: z.string().max(5000).optional().default(""),
  isReorder: z.boolean().optional().default(false),
});

export const pricingFeaturesSchema = z.object({
  product: z.string(),
  service: z.string(),
  quantity: z.number(),
  paperType: z.string(),
  size: z.string(),
  gsm: z.number(),
  colorMode: z.string(),
  sides: z.string(),
  finishingOptions: z.array(z.string()),
  finishingOptionsCount: z.number(),
  isDoubleSided: z.boolean(),
  isColorPrint: z.boolean(),
  isCustomSize: z.boolean(),
  hasUrgency: z.boolean(),
  hasSpecialInstructions: z.boolean(),
  isReorder: z.boolean(),
});

export const pricingResultSchema = z.object({
  predictedAmount: z.number(),
  formattedAmount: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  pricingSource: z.enum(["rule_based", "ml_model"]),
  features: pricingFeaturesSchema,
  breakdown: z.array(
    z.object({
      label: z.string(),
      amount: z.number(),
    })
  ),
});

export type PricingRequest = z.infer<typeof pricingRequestSchema>;
export type PricingFeatures = z.infer<typeof pricingFeaturesSchema>;
export type PricingResult = z.infer<typeof pricingResultSchema>;
