import { DynamicFieldCategory, UserDynamicFieldValue } from "@prisma/client";
import { Request } from "express";
import ApiError from "../../../errors/ApiErrors";
import { fileUploader } from "../../../helpars/fileUploader";
import prisma from "../../../shared/prisma";
import { updateUserDynamicFieldValueSchema } from "./dynamicUserData.validation";

// create dynamic User Data Service
const createDynamicUserData = async (payload: UserDynamicFieldValue) => {
  // Check if the dynamic user data exists
  const existingDynamicUserData = await prisma.userDynamicFieldValue.findFirst({
    where: {
      userId: payload.userId,
      category: payload.category,
      fieldName: payload.fieldName,
      fieldType: payload.fieldType,
    },
  });
  if (existingDynamicUserData) {
    throw new ApiError(400, "Dynamic user data already exists");
  }

  const newDynamicUserData = await prisma.userDynamicFieldValue.create({
    data: payload,
  });

  return newDynamicUserData;
};

// Update dynamic User Data Service
const updateDynamicUserData = async (req: Request) => {
  const { id } = req.params;
  const payload = req.body;
  const userId = req.user.id;

  const parsed = JSON.parse(payload.data);

  const existingDynamicUserData = await prisma.userDynamicFieldValue.findUnique(
    {
      where: { id },
    }
  );
  if (!existingDynamicUserData) {
    throw new ApiError(404, "Dynamic user data not found");
  }
  if (userId !== existingDynamicUserData.userId) {
    throw new ApiError(
      403,
      "You are not authorized to update this dynamic user data"
    );
  }

  let imageUrl;
  if (req.file) {
    const image = await fileUploader.uploadToDigitalOcean(req.file);
     imageUrl = image?.Location;
  }

  const validation = updateUserDynamicFieldValueSchema.safeParse(parsed);
  if (!validation.success) {
    throw new ApiError(400, validation.error.message);
  }

  const updateResult = await prisma.userDynamicFieldValue.update({
    where: { id },
    data: {
      category: parsed.category,
      fieldName: parsed.fieldName,
      fieldType: parsed.fieldType,
      value: parsed.fieldType === "FILE" ? imageUrl : parsed.value || existingDynamicUserData.value,
      text: parsed.text,
    },
  });

  return updateResult;
};

// Get all dynamic User Data Service
const getAllDynamicUserData = async () => {
  const allDynamicUserData = await prisma.userDynamicFieldValue.findMany();

  // Group by category (using UserDynamicFieldValue type)
  const groupedByCategory = Object.values(DynamicFieldCategory).reduce<
    Record<string, UserDynamicFieldValue[]>
  >((acc, category) => {
    acc[category] = allDynamicUserData.filter(
      (field) => field.category === category
    );
    return acc;
  }, {});

  return groupedByCategory;
};

// Get dynamic User Data by userId Service
const getDynamicUserDataByUserId = async (userId: string) => {
  const dynamicUserData = await prisma.userDynamicFieldValue.findMany({
    where: { userId },
  });

  return dynamicUserData;
};

//get dynamic user data by id
const getDynamicUserDataById = async (id: string) => {
  // Check if the dynamic user data exists
  const existingDynamicUserData = await prisma.userDynamicFieldValue.findUnique(
    {
      where: { id },
    }
  );

  if (!existingDynamicUserData) {
    throw new ApiError(404, "Dynamic user data not found");
  }

  const dynamicUserData = await prisma.userDynamicFieldValue.findUnique({
    where: { id },
  });

  return dynamicUserData;
};

// delete dynamic User Data Service
const deleteDynamicUserData = async (id: string) => {
  // Check if the dynamic user data exists
  const existingDynamicUserData = await prisma.userDynamicFieldValue.findUnique(
    {
      where: { id },
    }
  );
  if (!existingDynamicUserData) {
    throw new ApiError(404, "Dynamic user data not found");
  }

  const deleteResult = await prisma.userDynamicFieldValue.delete({
    where: { id },
  });

  return deleteResult;
};

const dynamicUserDataService = {
  createDynamicUserData,
  updateDynamicUserData,
  getAllDynamicUserData,
  getDynamicUserDataByUserId,
  deleteDynamicUserData,
  getDynamicUserDataById,
};

export default dynamicUserDataService;
