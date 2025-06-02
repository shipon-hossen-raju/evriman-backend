import { VerificationStatus } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  requesterName: z.string().min(1, "Requester name is required"),
  requesterEmail: z.string().email("Invalid email address"),
  requesterPhone: z.string().min(5, "Phone number is required"),
  requesterImage: z.string().min(1, "requesterImage is required"),
  
  deceasedName: z.string().min(1, "Deceased name is required"),
  deathCertificate: z.string().min(1, "deathCertificate is required"),
  deceasedProfileId: z.string().min(1, "Profile ID is required"),
  relationship: z.string().min(1, "Relationship is required"),
  deceasedDob: z.coerce.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date",
  }),

  optionalNote: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

const statusUpdateSchema = z.object({
  status: z.nativeEnum(VerificationStatus),
});

export const deathVerificationValidation = {
  createSchema,
  updateSchema,
  statusUpdateSchema,
};
