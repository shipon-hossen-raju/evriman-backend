import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { UserValidation } from "../User/user.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { authValidation } from "./auth.validation";

const router = express.Router();

// user login route
router.post(
  "/login",
  validateRequest(UserValidation.UserLoginValidationSchema),
  AuthController.loginUser
);

// user logout route
router.post("/logout", AuthController.logoutUser);

router.get(
  "/profile",
  auth(UserRole.ADMIN, UserRole.USER),
  AuthController.getMyProfile
);

router.put(
  "/change-password",
  auth(),
  validateRequest(authValidation.changePasswordValidationSchema),
  AuthController.changePassword
);

router.post(
  '/forgot-password',
  AuthController.forgotPassword
);
router.post(
  '/resend-otp',
  AuthController.resendOtp
);
router.post(
  '/verify-otp',
  AuthController.verifyForgotPasswordOtp
);
router.post(
  '/reset-password',
  AuthController.resetPassword
);

// verify email
router.post(
  '/verify-email',
  AuthController.verifyEmail
);

export const AuthRoutes = router;
