import { z } from "zod";

export const serviceInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Service name must be at least 2 characters.")
      .max(100, "Service name must be 100 characters or fewer."),
    category: z
      .string()
      .trim()
      .min(2, "Category must be at least 2 characters.")
      .max(60, "Category must be 60 characters or fewer."),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters.")
      .max(1000, "Description must be 1000 characters or fewer."),
    details: z
      .string()
      .trim()
      .max(3000, "Details must be 3000 characters or fewer.")
      .optional()
      .default(""),
    features: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Features cannot be empty.")
          .max(120, "Each feature must be 120 characters or fewer."),
      )
      .max(20, "Add up to 20 features.")
      .default([]),
    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Options cannot be empty.")
          .max(120, "Each option must be 120 characters or fewer."),
      )
      .max(20, "Add up to 20 options.")
      .default([]),
    idealFor: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Ideal-for entries cannot be empty.")
          .max(120, "Each ideal-for entry must be 120 characters or fewer."),
      )
      .max(20, "Add up to 20 ideal-for entries.")
      .default([]),
    imageUrl: z
      .union([z.string().url("Enter a valid image URL."), z.literal("")])
      .optional()
      .default(""),
    pricingMethod: z.enum(["FIXED", "PER_PAGE", "CUSTOM"]),
    basePrice: z.coerce
      .number()
      .min(0, "Base price cannot be negative.")
      .max(100000000, "Base price is too large."),
    minPrice: z
      .union([
        z.coerce.number().min(0, "Minimum price cannot be negative."),
        z.literal(""),
      ])
      .optional(),
    maxPrice: z
      .union([
        z.coerce.number().min(0, "Maximum price cannot be negative."),
        z.literal(""),
      ])
      .optional(),
    priceUnit: z
      .string()
      .trim()
      .min(1, "Price unit is required.")
      .max(40, "Price unit must be 40 characters or fewer.")
      .default("service"),
    displayOrder: z.coerce
      .number()
      .int("Display order must be a whole number.")
      .min(0, "Display order cannot be negative.")
      .max(100000, "Display order is too large."),
    isActive: z.boolean(),
  })
  .refine(
    (data) =>
      typeof data.minPrice !== "number" ||
      typeof data.maxPrice !== "number" ||
      data.minPrice <= data.maxPrice,
    {
      message: "Minimum price cannot be greater than maximum price.",
      path: ["maxPrice"],
    },
  );

export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type AdminService = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  details: string | null;
  features: string[];
  options: string[];
  idealFor: string[];
  imageUrl: string | null;
  pricingMethod: "FIXED" | "PER_PAGE" | "CUSTOM";
  basePrice: number;
  minPrice: number | null;
  maxPrice: number | null;
  priceUnit: string;
  displayOrder: number;
  isActive: boolean;
  orderCount: number;
};
export type AdminServicesPayload = {
  services: AdminService[];
  categories: string[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    popularName: string;
    popularOrders: number;
  };
};
