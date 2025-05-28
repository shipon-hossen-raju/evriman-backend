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
  "/partner-complete/",
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

// partner complete update
router.patch(
  "/partner/:id",
  validateRequest(userValidation.partnerStatusSchema),
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  userController.updatePartnerStatus
);

// *!get all  user
router.get("/", userController.getUsers);

// *!profile user
router.put(
  "/profile",
  // validateRequest(userValidation.userUpdateSchema),

  auth(UserRole.ADMIN, UserRole.USER, UserRole.PARTNER, UserRole.SUPER_ADMIN),
  fileUploader.uploadSingle,
  userController.updateProfile
);

// *!update  user
router.put("/:id", userController.updateUser);

export const userRoutes = router;
