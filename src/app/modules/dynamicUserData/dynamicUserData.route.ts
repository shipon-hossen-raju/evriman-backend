import express from "express";
import dynamicUserDataController from "./dynamicUserData.controller";
import validateRequest from "../../middlewares/validateRequest";
import { userDynamicFieldValueSchema } from "./dynamicUserData.validation";
import { parseBodyFileUploader } from "./dynamicUserData.FileUploader";
import { fileUploader } from "../../../helpars/fileUploader";

const dynamicUserDataRoute = express.Router();

// create dynamic user data
dynamicUserDataRoute.post(
  "/create",
  fileUploader.uploadFile,
  parseBodyFileUploader,
  validateRequest(userDynamicFieldValueSchema),
  dynamicUserDataController.createDynamicUserData
);

// update dynamic user data
dynamicUserDataRoute.patch(
  "/:id",
  fileUploader.uploadFile,
  parseBodyFileUploader,
  validateRequest(userDynamicFieldValueSchema),
  dynamicUserDataController.updateDynamicUserData
);

// get all dynamic user data
dynamicUserDataRoute.get(
   "/all",
   dynamicUserDataController.getAllDynamicUserData
);

// get dynamic user data by userId
dynamicUserDataRoute.get(
  "/user/:userId",
  dynamicUserDataController.getDynamicUserDataByUserId
);

// get dynamic user data by id
dynamicUserDataRoute.get(
  "/:id",
  dynamicUserDataController.getDynamicUserDataById
);

// delete dynamic user data
dynamicUserDataRoute.delete(
   "/:id",
   dynamicUserDataController.deleteDynamicUserData
);

export default dynamicUserDataRoute;
