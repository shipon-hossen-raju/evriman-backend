import { DynamicField } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import toSnakeCase from "../../../utils/toSnakeCase";

// create a dynamic field
const createDynamicField = async (payload: DynamicField) => {
  console.log("payload -> ", payload);

  // generate a field name from the label
  const fieldName = toSnakeCase(payload.label);

  // Check if the field name already exists
  const existingField = await prisma.dynamicField.findUnique({
    where: { fieldName_category: { fieldName, category: payload.category } },
  });

  if (existingField) {
    throw new ApiError(
      400,
      `Field name ${fieldName} already exists. Please choose a different name.`
    );
  }

  // Check if the field name is valid
  const dynamicField = await prisma.dynamicField.create({
    data: {
      ...payload,
      fieldName,
    },
  });

  return dynamicField;
};

// dynamic field update
const updateDynamicField = async (id: string, payload: DynamicField) => {
  // Check if the dynamic field exists
  const findDynamicField = await prisma.dynamicField.findUnique({
    where: { id },
  });

  if (!findDynamicField) {
    throw new ApiError(404, "Dynamic field not found");
  }

  // Check if the field name is valid
  const fieldName = toSnakeCase(payload.label);

  // Check if the field name already exists
  const existingFieldName = await prisma.dynamicField.findUnique({
    where: { fieldName_category: { fieldName, category: payload.category } },
  });

  if (existingFieldName && existingFieldName.id !== id) {
    throw new ApiError(
      400,
      `Field name ${fieldName} already exists. Please choose a different name.`
    );
  }

  // Update the dynamic field
  const updatedDynamicField = await prisma.dynamicField.update({
    where: { id },
    data: {
      ...payload,
      fieldName,
    },
  });

  return updatedDynamicField;
};

// get all dynamic fields
// const getAllDynamicFields = async () => {
//   const dynamicFields = await prisma.dynamicField.findMany();

//   if (!dynamicFields) {
//     throw new ApiError(404, "No dynamic fields found");
//   }

//   return dynamicFields;
// };

export const getAllDynamicFields = async (category?: string) => {
  const whereCondition = category
    ? {
        category: category as any, // You can cast to enum if using strict enums
      }
    : {};

  const dynamicFields = await prisma.dynamicField.findMany({
    where: whereCondition,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!dynamicFields || dynamicFields.length === 0) {
    throw new ApiError(404, "No dynamic fields found");
  }

  return dynamicFields;
};

// get a dynamic field by ID
const getDynamicFieldById = async (id: string) => {
  const dynamicField = await prisma.dynamicField.findUnique({
    where: { id },
  });

  if (!dynamicField) {
    throw new ApiError(404, "Dynamic field not found");
  }

  return dynamicField;
};

// delete a dynamic field
const deleteDynamicField = async (id: string) => {
  // Check if the dynamic field exists
  const findDynamicField = await prisma.dynamicField.findUnique({
    where: { id },
  });

  if (!findDynamicField) {
    throw new ApiError(404, "Dynamic field not found");
  }

  // Delete the dynamic field
  const deletedDynamicField = await prisma.dynamicField.delete({
    where: { id },
  });

  return deletedDynamicField;
};

// export all the functions
const dynamicFieldService = {
  createDynamicField,
  getAllDynamicFields,
  getDynamicFieldById,
  updateDynamicField,
  deleteDynamicField,
};

export default dynamicFieldService;
