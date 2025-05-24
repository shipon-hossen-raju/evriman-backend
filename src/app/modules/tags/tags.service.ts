import { Tags } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import toSnakeCase from "../../../utils/toSnakeCase";

// create a tag
const createTags = async (payload: Tags) => {
  // generate route
  const routeName = toSnakeCase(payload.name);

  const findTag = await prisma.tags.findUnique({
    where: {
      route: routeName,
    },
  });

  if (findTag) {
    throw new ApiError(400, `${payload.name} already exists`);
  }

  // Check if the field name is valid
  const tags = await prisma.tags.create({
    data: {
      ...payload,
      status: true,
      route: routeName,
    },
  });

  return tags;
};

// Tag update
const updateTag = async (id: string, payload: Tags) => {
  // Check if the dynamic field exists
  const findTags = await prisma.tags.findUnique({
    where: { id },
  });

  if (!findTags) {
    throw new ApiError(404, "Tags not found");
  }

  // Generate new route name from updated tag name
  const routeName = toSnakeCase(payload.name);

  // Check if the new route name already exists for another tag
  const existingTag = await prisma.tags.findFirst({
    where: {
      route: routeName,
    },
  });

  if (existingTag) {
    throw new ApiError(400, `${payload.name} already exists`);
  }

  const updatedTag = await prisma.tags.update({
    where: { id },
    data: {
      ...payload,
      route: routeName,
    },
  });

  return updatedTag;
};

// get all tags
const getAllTags = async () => {
  const allFields = await prisma.tags.findMany({});

  return allFields;
};

// get all tags
const getTagsById = async (id: string) => {
  const tag = await prisma.tags.findUnique({
    where: {
      id,
    },
  });

  return tag;
};

// delete a tags
const deleteTags = async (id: string) => {
  // Check if the dynamic field exists
  const findTags = await prisma.tags.findUnique({
    where: { id },
  });

  if (!findTags) {
    throw new ApiError(404, "Tags not found");
  }

  // Delete the dynamic field
  const deletedTag = await prisma.tags.delete({
    where: { id },
  });

  return deletedTag;
};

// export all the functions
const tagsService = {
  createTags,
  getAllTags,
  updateTag,
  deleteTags,
  getTagsById,
};

export default tagsService;
