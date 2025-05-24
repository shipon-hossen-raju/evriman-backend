import { z } from "zod";

export const contactListSchema = z.object({
  userId: z.string().min(1, "User ID is required"),

  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phoneNumber: z.string(),
  photoUrl: z.string().url("Invalid photo URL").optional(),

  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date of birth",
  }),

  relationship: z.string().min(1, "Relationship is required"),
  isOver18: z.boolean(),

  note: z.string().optional(),

  guardianName: z.string().optional(),
  guardianEmail: z.string().email().optional(),
  guardianDob: z.string().optional(),
  guardianPhoneNumber: z.string().optional(),
});