import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { memoryClaimRequestController } from "./memoryClaimRequest.controller";
import { parseBodyFileUploader } from "./memoryClaimRequest.parseBodyFileUploader";
import { memoryClaimRequestValidation } from "./memoryClaimRequest.validation";
import { UserRole } from "@prisma/client";

const memoryClaimRouter = express.Router();

// create memory claim 
memoryClaimRouter.post(
  "/create",
//   auth(),
  fileUploader.uploadSingle,
  parseBodyFileUploader,
  validateRequest(memoryClaimRequestValidation.createSchema),
  memoryClaimRequestController.createMemoryClaimRequest
);

// 
memoryClaimRouter.get(
  "/",
  auth(),
  memoryClaimRequestController.getMemoryClaimRequestList
);

memoryClaimRouter.get(
  "/:id",
  auth(),
  memoryClaimRequestController.getMemoryClaimRequestById
);

memoryClaimRouter.put(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(memoryClaimRequestValidation.updateSchema),
  memoryClaimRequestController.updateMemoryClaimRequest
);

memoryClaimRouter.delete(
  "/:id",
  auth(UserRole.ADMIN),
  memoryClaimRequestController.deleteMemoryClaimRequest
);

export const memoryClaimRequestRoutes = memoryClaimRouter;
