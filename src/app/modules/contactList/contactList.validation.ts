import { z } from "zod";

// Reusable validation for optional strings
const optionalString = z.string();

export const contactListSchema = z
  .object({
    userId: z.string().min(1, "User ID is required"),

    name: z.string().min(1, "Name is required"),
    email: optionalString.email("Invalid email").optional(),
    phoneNumber: optionalString,
    photoUrl: optionalString.url("Invalid photo URL").optional(),

    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date of birth",
    }),

    relationship: z.string().min(1, "Relationship is required"),
    isOver18: z.boolean(),

    note: optionalString.optional(),

    // Guardian fields – required only if isOver18 is false
    guardianName: optionalString.optional(),
    guardianEmail: optionalString.email("Invalid guardian email").optional(),
    guardianDob: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid guardian DOB",
      })
      .optional(),
    guardianPhoneNumber: optionalString.optional(),
  })
//   .superRefine((data, ctx) => {
//     if (!data.isOver18) {
//       if (!data.guardianName) {
//         ctx.addIssue({
//           path: ["guardianName"],
//           code: z.ZodIssueCode.custom,
//           message: "Guardian name is required for underage contacts",
//         });
//       }
//       if (!data.guardianEmail) {
//         ctx.addIssue({
//           path: ["guardianEmail"],
//           code: z.ZodIssueCode.custom,
//           message: "Guardian email is required for underage contacts",
//         });
//       }
//       if (!data.guardianDob) {
//         ctx.addIssue({
//           path: ["guardianDob"],
//           code: z.ZodIssueCode.custom,
//           message: "Guardian DOB is required for underage contacts",
//         });
//       }
//       if (!data.guardianPhoneNumber) {
//         ctx.addIssue({
//           path: ["guardianPhoneNumber"],
//           code: z.ZodIssueCode.custom,
//           message: "Guardian phone number is required for underage contacts",
//         });
//       }
//     }
//   }) as unknown as z.AnyZodObject;
