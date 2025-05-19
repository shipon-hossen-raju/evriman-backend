import { LoginType } from "@prisma/client";
import { z } from "zod";

const changePasswordValidationSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export const UserLoginValidationSchema = z.object({
  email: z.string().email().nonempty("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
  LoginType: z.nativeEnum(LoginType).default(LoginType.USER),
});

export const authValidation = {
  changePasswordValidationSchema,
  UserLoginValidationSchema
};



