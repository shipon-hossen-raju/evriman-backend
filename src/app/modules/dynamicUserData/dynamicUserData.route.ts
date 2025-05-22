import express from "express";
import dynamicUserDataController from "./dynamicUserData.controller";
import validateRequest from "../../middlewares/validateRequest";
import { userDynamicFieldValueSchema } from "./dynamicUserData.validation";

const dynamicUserDataRoute = express.Router();

// create dynamic user data
dynamicUserDataRoute.post(
   "/create",
   validateRequest(userDynamicFieldValueSchema),
   dynamicUserDataController.createDynamicUserData
);

export default dynamicUserDataRoute;
