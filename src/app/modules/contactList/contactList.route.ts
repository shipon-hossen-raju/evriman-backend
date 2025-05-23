import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import validateRequest from "../../middlewares/validateRequest";
import contactListController from "./contactList.controller";
import { parseBodyFileUploader } from "./contactList.fileUploader";
import { contactListSchema } from "./contactList.validation";

const contactListRouter = express.Router();

// create contact list
contactListRouter.post(
  "/create",
  fileUploader.uploadSingle,
  parseBodyFileUploader,
  validateRequest(contactListSchema),
  contactListController.contactListCreate
);

export default contactListRouter;
