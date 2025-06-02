import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

const createPaymentRequest = z.object({
  subscriptionPlanId: z.string(),
  pricingOptionId: z.string(),
  offerCode: z.string().optional(),
});
const paymentConfirmSchema = z.object({
  stripePaymentIntentId: z.string().min(1, "stripePaymentIntentId is require!"),
  status: z.nativeEnum(PaymentStatus),
  id: z.string().min(1, "stripePaymentIntentId is require!"),
});

export const paymentValidation = {
  createSchema,
  updateSchema,
  createPaymentRequest,
  paymentConfirmSchema,
};
