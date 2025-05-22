import { DynamicField } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createDynamicField = async (payload: DynamicField) => {
   console.log("payload -> ", payload);

   // generate a field name from the label
   const fieldName = toSnakeCase(payload.label);

   // Check if the field name already exists
   const existingField = await prisma.dynamicField.findUnique({
     where: { fieldName },
   });
   if (existingField) {
     throw new Error(`Field name "${fieldName}" already exists.`);
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

const dynamicFieldService = {
  createDynamicField,
};

export default dynamicFieldService;
