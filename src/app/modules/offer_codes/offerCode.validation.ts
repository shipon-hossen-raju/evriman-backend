import { z } from "zod";

// Enums
export const DiscountTypeEnum = z.enum(["PERCENTAGE", "FIXED"]);
export const UserTypeEnum = z.enum(["ALL", "PAID", "NONPAID", "SELECTED"]);

export const OfferCodeSchema = z.object({
  code: z.string().min(3).max(20),
  discountType: DiscountTypeEnum,
  discountValue: z.number().positive(),
  applicablePlans: z.array(z.string().min(1)), // Plan IDs
  userType: UserTypeEnum,
  targetUserId: z.array(z.string()).optional(), // User IDs
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true),
});
