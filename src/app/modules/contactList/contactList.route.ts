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

// find all contact list
contactListRouter.get("/", contactListController.getAllContactList);

// find contact list by userId
contactListRouter.get(
  "/user/:userId",
  contactListController.contactListFindByUserId
);

// contact list update
contactListRouter.get(
  "/:id",
  contactListController.updateContactList
);

export default contactListRouter;
