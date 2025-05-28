import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import { parseBodyFileUploader } from "./deathVerification.parseBodyFileUploader";
import { deathVerificationValidation } from "./deathVerification.validation";
import validateRequest from "../../middlewares/validateRequest";
import { deathVerificationController } from "./deathVerification.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/create",
  // auth(),
  fileUploader.uploadSingle,
  parseBodyFileUploader,
  validateRequest(deathVerificationValidation.createSchema),
  deathVerificationController.createDeathVerification
);

// Get a list of death verifications
router.get(
  "/",
  auth(UserRole.ADMIN),
  deathVerificationController.getDeathVerificationList
);

// Get a death verification by ID
router.get(
  "/:id",
  auth(UserRole.ADMIN),
  deathVerificationController.getDeathVerificationById
);

// Update a death verification
router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(deathVerificationValidation.updateSchema),
  deathVerificationController.updateDeathVerification
);

// Update a death verification
router.put(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(deathVerificationValidation.statusUpdateSchema),
  deathVerificationController.statusUpdateDeathVerification
);

// delete a death verification
router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  deathVerificationController.deleteDeathVerification
);

export const deathVerificationRoutes = router;
