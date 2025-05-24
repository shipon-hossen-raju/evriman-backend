import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import tagsController from "./tags.controller";
import { createTagSchema, updateTagSchema } from "./tags.validation";

const tagsRoute = express.Router();

// Route to create a tag
tagsRoute.post(
  "/create",
  auth(),
  validateRequest(createTagSchema),
  tagsController.createTags
);

// Route to get all tags
tagsRoute.get("/", tagsController.getAllTags);

// Route to get all tags
// tagsRoute.get("/", tagsController.);

// Route to get a tag by ID
tagsRoute.get("/:id", tagsController.getTagById);

// Route to update a tag
tagsRoute.patch(
  "/:id",
  validateRequest(updateTagSchema),
  tagsController.updateTag
);

// Route to delete a tag
tagsRoute.delete("/:id", tagsController.deleteTag);

export default tagsRoute;
