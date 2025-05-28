import { UserRole } from "@prisma/client";
import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import contactListController from "./contactList.controller";
import { parseBodyFileUploader } from "./contactList.fileUploader";
import { contactListSchema } from "./contactList.validation";

const contactListRouter = express.Router();

// create contact list
contactListRouter.post(
  "/create",
  auth(UserRole.USER, UserRole.PARTNER),
  fileUploader.uploadSingle,
  parseBodyFileUploader,
  validateRequest(contactListSchema),
  contactListController.contactListCreate
);

// find all contact list
contactListRouter.get(
  "/",
  auth(UserRole.ADMIN),
  contactListController.getAllContactList
);

// find contact list by userId
contactListRouter.get(
  "/user/",
  auth(UserRole.USER, UserRole.PARTNER),
  contactListController.contactListFindByUserId
);

// contact list update
contactListRouter.get(
  "/:id",
  auth(UserRole.USER, UserRole.PARTNER),
  fileUploader.uploadSingle,
  parseBodyFileUploader,
  validateRequest(contactListSchema),
  contactListController.updateContactList
);

// delete contact list
contactListRouter.delete(
  "/:id",
  auth(UserRole.USER, UserRole.PARTNER),
  contactListController.deleteContactList
);

export default contactListRouter;
