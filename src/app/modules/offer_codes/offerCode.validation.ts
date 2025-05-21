import { z } from "zod";

export const offerCodeSchema = z.object({
  code: z.string(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0),
  userType: z.enum(["ALL", "PAID", "NON_PAID", "SELECTED"]),
  targetUserId: z.array(z.string()).optional(),
  expiresAt: z.string().datetime(),
  applicablePlans: z.array(z.string()).optional(),
  pricingOptionsLevelId: z.array(z.string()).optional(),
});
