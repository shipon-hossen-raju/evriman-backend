import { UserMemory } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const createUserMemory = async (payload: UserMemory) => {
  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Create the memory
  const memory = await prisma.userMemory.create({
    data: {
      ...payload,
    },
  });

  return memory;
};

const userMemoryService = {
  createUserMemory,
};

export default userMemoryService;
