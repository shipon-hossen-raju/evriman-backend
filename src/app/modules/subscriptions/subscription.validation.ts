import { z } from "zod";
import { LevelId } from "@prisma/client";

export const eligibilitySchema = z.object({
  minAge: z.number().int().min(1),
});

export const pricingOptionSchema = z.object({
  label: z.string(),
  levelId: z.custom<LevelId>(),
  amount: z.number(),
  durationInMonths: z.number().int().nullable(),
  eligibility: eligibilitySchema.optional().nullable(),
});

export const subscriptionPlanSchema = z.object({
  name: z.string(),
  contactLimit: z.number().int(),
  isActive: z.boolean().optional().default(true),
  pricingOptions: z.array(pricingOptionSchema),
});

export const subscriptionPlanUpdateSchema = z.object({
  name: z.string().optional(),
  contactLimit: z.number().int().optional(),
  isActive: z.boolean().default(true).optional(),
  pricingOptions: z.array(pricingOptionSchema).optional(),
});