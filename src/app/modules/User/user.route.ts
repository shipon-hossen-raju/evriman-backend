import { UserRole } from "@prisma/client";
import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import { parseBodyFileUploader } from "../../../utils/parseBodyFileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = express.Router();

// *!register user
router.post(
  "/register",
  fileUploader.uploadSingle,
  parseBodyFileUploader,
  validateRequest(userValidation.CreateUserValidationSchema),
  userController.createUser
);

// partner complete profile
router.put(
  "/profile-complete/",
  auth(),
  validateRequest(userValidation.partnerCompleteProfileSchema),
  userController.partnerCompleteProfile
);

// partner complete profile
router.get(
  "/partner/all",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  userController.getAllPartner
);

// partner complete profile
router.get(
  "/partner/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  userController.getPartner
);

// partner status update
router.patch(
  "/partner/:id",
  validateRequest(userValidation.partnerStatusSchema),
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  userController.updatePartnerStatus
);

// view profile
router.get("/user-view-profile/:profileId", auth(), userController.viewProfile);

// *!get all  user
router.get("/all", userController.getUsers);

// get Notification
router.get("/notification", auth(), userController.getNotification);

// get Notification death status
router.patch(
  "/notification-death-status",
  auth(),
  validateRequest(userValidation.notificationDeathStatus),
  userController.notificationDeathStatus
);

// *!profile user
router.put(
  "/profile",
  // validateRequest(userValidation.userUpdateSchema),

  auth(UserRole.ADMIN, UserRole.USER, UserRole.PARTNER, UserRole.SUPER_ADMIN),
  fileUploader.uploadSingle,
  userController.updateProfile
);

// profile image update
router.put(
  "/profile-image",
  auth(),
  fileUploader.uploadSingle,
  userController.profileImageUpload
);

// *!update  user
router.put("/:id", userController.updateUser);

export const userRoutes = router;
