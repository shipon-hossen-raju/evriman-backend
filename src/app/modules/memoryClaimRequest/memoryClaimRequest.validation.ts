import { VerificationStatus } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  claimantName: z.string().min(1, "Full name is required"),
  claimantEmail: z.string().email("Invalid email"),
  claimantPhone: z.string().min(7, "Invalid phone number"),
  claimantDob: z.coerce.date(),

  deceasedName: z.string().min(1, "Deceased name is required"),
  deceasedProfileId: z.string().min(1, "Profile ID is required"),
  relationship: z.string().min(1, "Relationship is required"),
  deceasedDob: z.coerce.date(),
  deathCertificate: z.string().min(1, "Death certificate is required"),
  
  contactId: z.string().min(1, "Contact ID is required"),
  optionalNote: z.string().optional(),
});

const updateSchema = z.object({
  status: z.nativeEnum(VerificationStatus)
});

export const memoryClaimRequestValidation = {
  createSchema,
  updateSchema,
};
