import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import tagsController from "./tags.controller";
import { createTagSchema, updateTagSchema } from "./tags.validation";
import { UserRole } from "@prisma/client";

const tagsRoute = express.Router();

// Route to create a tag
tagsRoute.post(
  "/create",
  auth(UserRole.ADMIN),
  validateRequest(createTagSchema),
  tagsController.createTags
);

// Route to get all tags
tagsRoute.get("/", auth(), tagsController.getAllTags);

// Route to get a tag by ID
tagsRoute.get("/:id", auth(), tagsController.getTagById);

// Route to update a tag
tagsRoute.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(updateTagSchema),
  tagsController.updateTag
);

// Route to delete a tag
tagsRoute.delete("/:id",
  auth(UserRole.ADMIN),
  tagsController.deleteTag);

export default tagsRoute;
