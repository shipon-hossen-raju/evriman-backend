import { LoginType, PartnerType, UserRole, VerificationStatus } from "@prisma/client";
import { z } from "zod";

// Helper schemas
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number too long");

const dateSchema = z.preprocess((arg) => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
}, z.date());

// Main schemas
export const CreateUserValidationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  phoneNumber: phoneSchema,
  dob: dateSchema
    .refine(
      (date) => date <= new Date(),
      "Date of birth cannot be in the future"
    )
    .optional(),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  loginType: z.nativeEnum(LoginType).default(LoginType.USER),
  termsAccepted: z
    .literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    })
    .optional(),
  privacyAccepted: z
    .literal(true, {
      errorMap: () => ({ message: "You must accept the privacy policy" }),
    })
    .optional(),
  referralCodeUsed: z.string().optional(),
  address: z.string().optional(),
  idDocument: z.string().optional(),

  // partner information
  partnerAgreement: z
    .literal(true, {
      errorMap: () => ({ message: "You must accept the partner agreement" }),
    })
    .optional(),
  partnerType: z.nativeEnum(PartnerType).default("MORTGAGE_BROKER").optional(),
  businessName: z.string().min(2).optional(),

  isNewData: z.boolean({
    errorMap: () => ({ message: "You must be a new user to register" }),
  }),
});

const partnerCompleteProfileSchema = z.object({
  bankName: z.string().optional(),
  accountHolderName: z.string().optional(),
  accountNumber: z.string().optional(),
  shortCode: z.string().optional()
});

const partnerStatusSchema = z.object({
  partnerStatus: z.nativeEnum(VerificationStatus)
});


export const userValidation = {
  CreateUserValidationSchema,
  partnerCompleteProfileSchema,
  partnerStatusSchema,
};
