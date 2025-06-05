import { UserRole } from "@prisma/client";
import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import dynamicUserDataController from "./dynamicUserData.controller";
import { parseBodyFileUploader } from "./dynamicUserData.FileUploader";
import { userDynamicFieldValueSchema } from "./dynamicUserData.validation";

const dynamicUserDataRoute = express.Router();

// create dynamic user data
dynamicUserDataRoute.post(
  "/create",
  auth(UserRole.USER, UserRole.PARTNER),
  fileUploader.uploadFile,
  parseBodyFileUploader,
  validateRequest(userDynamicFieldValueSchema),
  dynamicUserDataController.createDynamicUserData
);

// update dynamic user data
dynamicUserDataRoute.patch(
  "/:id",
  auth(UserRole.USER, UserRole.PARTNER),
  fileUploader.uploadFile,
  parseBodyFileUploader,
  validateRequest(userDynamicFieldValueSchema),
  dynamicUserDataController.updateDynamicUserData
);

// get all dynamic user data
dynamicUserDataRoute.get(
  "/all",
  auth(),
  dynamicUserDataController.getAllDynamicUserData
);

// get dynamic user data by userId
dynamicUserDataRoute.get(
  "/user/:userId",
  auth(UserRole.USER, UserRole.PARTNER),
  dynamicUserDataController.getDynamicUserDataByUserId
);

// get dynamic user data by id
dynamicUserDataRoute.get(
  "/:id",
  auth(),
  dynamicUserDataController.getDynamicUserDataById
);

// delete dynamic user data
dynamicUserDataRoute.delete(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  dynamicUserDataController.deleteDynamicUserData
);

export default dynamicUserDataRoute;
