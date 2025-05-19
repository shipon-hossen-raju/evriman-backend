import { UserRole } from "@prisma/client";
import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import { parseBodyFileUploader } from "../../../utils/parseBodyFileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { UserValidation } from "./user.validation";
// import { fromDataFileUpload } from "../../../utils/FromDataFileUpload";

const router = express.Router();

// *!register user
router.post(
  "/register",
  fileUploader.uploadSingle,
  parseBodyFileUploader,
  validateRequest(UserValidation.CreateUserValidationSchema),
  userController.createUser
);

// *!get all  user
router.get("/", userController.getUsers);

// *!profile user
router.put(
  "/profile",
  // validateRequest(UserValidation.userUpdateSchema),

  auth(UserRole.ADMIN, UserRole.USER),
  fileUploader.uploadSingle,
  userController.updateProfile
);

// *!update  user
router.put("/:id", userController.updateUser);

export const userRoutes = router;
