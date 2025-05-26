import { DeathVerification } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

// create a new death verification record
const createIntoDb = async (payload: DeathVerification) => {
  const result = await prisma.deathVerification.create({ data: payload });
  return result;
};

// This function retrieves a list of death verifications from the database.
const getListFromDb = async () => {
  const result = await prisma.deathVerification.findMany();
  return result;
};

const getByIdFromDb = async (id: string) => {
  const result = await prisma.deathVerification.findUnique({
    where: { id },
  });

  if (!result) {
    throw new Error("DeathVerification not found");
  }

  // find the user by profile ID
  const user = await prisma.user.findUnique({
    where: { userId: result.deceasedProfileId },
    select: {
      id: true,
      userId: true,
      isDeceased: true,
      email: true,
      fullName: true,
    },
  });

  return { ...result, user: {...user} };
};

const updateIntoDb = async (id: string, data: any) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.deathVerification.update({
      where: { id },
      data,
    });
    return result;
  });

  return transaction;
};

// status update into db
const statusUpdateIntoDb = async (id: string, data: any) => {
  // find the death verification by ID
  const deathCertificate = await prisma.deathVerification.findUnique({
    where: { id },
  });
  if (!deathCertificate) {
    throw new ApiError(httpStatus.NOT_FOUND, "DeathVerification not found");
  }
  // Check if the status is already set to the requested status
  if (deathCertificate.status === data.status) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `DeathVerification status is already set to ${data.status}`
    );
  }

  // find the user by profile ID
  const user = await prisma.user.findUnique({
    where: { userId: deathCertificate.deceasedProfileId },
    select: {
      id: true,
      userId: true,
      isDeceased: true,
    }
  });
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found for the provided deceasedProfileId"
    );
  }

  // update the user's isDeceased status
  const updatedUser = await prisma.user.update({
    where: { userId: user.userId },
    data: {
      isDeceased: data.status === "APPROVED" ? true : false,
    }
  });
  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // update the death verification status
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.deathVerification.update({
      where: { id },
      data,
    });
    return result;
  });

  return transaction;
};

const deleteItemFromDb = async (id: string) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const deletedItem = await prisma.deathVerification.delete({
      where: { id },
    });

    // Add any additional logic if necessary, e.g., cascading deletes
    return deletedItem;
  });

  return transaction;
};

export const deathVerificationService = {
  createIntoDb,
  getListFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteItemFromDb,
  statusUpdateIntoDb,
};
