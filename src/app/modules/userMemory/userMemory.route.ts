import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import userMemoryController from "./userMemory.controller";
import { parseBodyFileUploader } from "./userMemory.FileUploader";
import { createUserMemorySchema } from "./userMemory.validation";

const userMemoryRoute = express.Router();

userMemoryRoute.post(
  "/create",
  auth(),
  fileUploader.uploadMultipleFiles,
  parseBodyFileUploader,
  validateRequest(createUserMemorySchema),
  userMemoryController.createUserMemoryData
);

export default userMemoryRoute;
