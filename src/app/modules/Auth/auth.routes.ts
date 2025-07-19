import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { authController } from "./auth.controller";

const router = express.Router();

// user login route
router.post(
  "/login",
  validateRequest(authValidation.UserLoginValidationSchema),
  authController.loginUser
);
// verify email
router.post("/verify-email", authController.verifyEmail);
// user logout route
router.post("/logout", authController.logoutUser);

// forgot password
router.post("/forgot-password", authController.forgotPassword);

// reset password
router.post("/reset-password", authController.resetPassword);

router.get(
  "/profile",
  // auth(UserRole.USER, UserRole.PARTNER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  auth(),
  authController.getMyProfile
);

router.put(
  "/change-password",
  auth(),
  validateRequest(authValidation.changePasswordValidationSchema),
  authController.changePassword
);

router.post("/resend-otp", authController.resendOtp);
router.post("/verify-otp", authController.verifyForgotPasswordOtp);

export const authRoutes = router;
