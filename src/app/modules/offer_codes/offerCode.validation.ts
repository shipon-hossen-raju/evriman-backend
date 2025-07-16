import { DiscountType, LevelId, UserType } from "@prisma/client";
import { z } from "zod";

export const offerCodeSchema = z.object({
  code: z.string(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().min(0),
  userType: z.nativeEnum(UserType),
  targetUsers: z.array(z.string()).optional(),
  expiresAt: z.string().datetime(),
  applicablePlans: z.array(z.string()).optional(),
  pricingOptionsLevelId: z.array(z.string()).optional(),
  optionLevelId: z.nativeEnum(LevelId).optional(),
});
