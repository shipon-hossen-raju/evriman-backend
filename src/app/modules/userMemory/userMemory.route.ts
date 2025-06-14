import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import userMemoryController from "./userMemory.controller";
import { parseBodyFileUploader } from "./userMemory.FileUploader";
import { createUserMemorySchema } from "./userMemory.validation";

const userMemoryRoute = express.Router();

// Get all User Memory data
userMemoryRoute.post(
  "/create",
  auth(),
  fileUploader.uploadMultipleFiles,
  parseBodyFileUploader,
  validateRequest(createUserMemorySchema),
  userMemoryController.createUserMemoryData
);

// update user memory data 
userMemoryRoute.patch("/:id",
  auth(),
  fileUploader.uploadMultipleFiles,
  parseBodyFileUploader,
  validateRequest(createUserMemorySchema),
  userMemoryController.updateUserMemory
)

// get all User Memory data find & search query
userMemoryRoute.get("/", auth(), userMemoryController.getUserMemoriesAll);

userMemoryRoute.get("/all", auth(), userMemoryController.getAllUserMemoryData);

// get User Memory data by id
userMemoryRoute.get(
  "/:id",
  auth(),
  userMemoryController.getUserMemoryById
);

// delete User Memory data by id
userMemoryRoute.delete(
  "/:id",
  auth(),
  userMemoryController.deleteUserMemory
);



export default userMemoryRoute;
