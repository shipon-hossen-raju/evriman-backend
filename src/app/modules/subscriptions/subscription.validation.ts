import { z } from "zod";

// Eligibility Schema
const eligibilitySchema = z.object({
  minAge: z.number().min(0, "Minimum age must be 0 or greater"),
});

// Pricing Option Schema
const pricingOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required"),
  amount: z.number().min(0, "Amount must be a positive number"),
  durationInMonths: z.number().int().min(1).nullable(),
  eligibility: eligibilitySchema.optional(),
});

// Main Subscription Plan Schema
export const subscriptionPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  contactLimit: z.number().int().min(1, "Contact limit must be at least 1"),
  isActive: z.boolean().optional().default(true),
  pricingOptions: z
    .array(pricingOptionSchema)
    .min(1, "At least one pricing option is required"),
});

// Main Subscription Plan Schema
export const UpdateSubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  contactLimit: z.number().int().min(1, "Contact limit must be at least 1"),
  isActive: z.boolean().optional().default(true),
  pricingOptions: z
    .array(pricingOptionSchema)
    .min(1, "At least one pricing option is required"),
});
