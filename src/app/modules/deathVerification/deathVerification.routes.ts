import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import { parseBodyFileUploader } from "./deathVerification.parseBodyFileUploader";
import { deathVerificationValidation } from "./deathVerification.validation";
import validateRequest from "../../middlewares/validateRequest";
import { deathVerificationController } from "./deathVerification.controller";
import auth from "../../middlewares/auth";

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
router.get("/", auth(), deathVerificationController.getDeathVerificationList);

// Get a death verification by ID
router.get(
  "/:id",
  auth(),
  deathVerificationController.getDeathVerificationById
);

// Update a death verification
router.patch(
  "/:id",
  auth(),
  validateRequest(deathVerificationValidation.updateSchema),
  deathVerificationController.updateDeathVerification
);

// Update a death verification
router.put(
  "/:id",
  auth(),
  validateRequest(deathVerificationValidation.statusUpdateSchema),
  deathVerificationController.statusUpdateDeathVerification
);

// delete a death verification
router.delete(
  "/:id",
  auth(),
  deathVerificationController.deleteDeathVerification
);

export const deathVerificationRoutes = router;
