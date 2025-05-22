import { UserDynamicFieldValue } from "@prisma/client";
import prisma from "../../../shared/prisma";

// create dynamic User Data Service
const createDynamicUserData = async (payload: UserDynamicFieldValue) => {
  const newDynamicUserData = await prisma.userDynamicFieldValue.create({
    data: payload,
  });

  return newDynamicUserData;
};

const dynamicUserDataService = {
  createDynamicUserData,
};

export default dynamicUserDataService;
