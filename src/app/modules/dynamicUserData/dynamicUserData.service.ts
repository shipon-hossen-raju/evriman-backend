import { UserDynamicFieldValue } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

// create dynamic User Data Service
const createDynamicUserData = async (payload: UserDynamicFieldValue) => {
  const newDynamicUserData = await prisma.userDynamicFieldValue.create({
    data: payload,
  });

  return newDynamicUserData;
};

// Update dynamic User Data Service
const updateDynamicUserData = async (
  id: string,
  payload: UserDynamicFieldValue
) => {
  const updateResult = await prisma.userDynamicFieldValue.update({
    where: { id },
    data: payload,
  });

  return updateResult;
};

// Get all dynamic User Data Service
const getAllDynamicUserData = async () => {
  const allDynamicUserData = await prisma.userDynamicFieldValue.findMany();

  return allDynamicUserData;
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
