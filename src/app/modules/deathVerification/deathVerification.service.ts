import { DeathVerification, VerificationStatus } from "@prisma/client";
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
  const result = await prisma.deathVerification.findMany({
    where: {
      OR: [
        {
          status: "CHECKING",
        },
        {
          status: "PENDING",
        },
      ],
    },
  });
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
      phoneNumber: true,
      dob: true,
      address: true,
      userImage: true,
      partnerImage: true,
      lastLogin: true,
      ContactList: true,
      _count: {
        select: {
          ContactList: {
            where: {
              isDeath: true,
              isDeathNotify: true,
            },
          },
        },
      },
    },
  });

  // contact list
  // const findContactList

  return { ...result, user: { ...user } };
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
const statusUpdateIntoDb = async (
  id: string,
  payload: { status: VerificationStatus; extraNote: string }
) => {
  // find the death verification by ID
  const deathCertificate = await prisma.deathVerification.findUnique({
    where: { id },
  });
  if (!deathCertificate) {
    throw new ApiError(httpStatus.NOT_FOUND, "DeathVerification not found");
  }
  // Check if the status is already set to the requested status
  if (deathCertificate.status === payload.status) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `DeathVerification status is already set to ${payload}`
    );
  }

  // find the user by profile ID
  const user = await prisma.user.findUnique({
    where: { userId: deathCertificate.deceasedProfileId },
    select: {
      id: true,
      userId: true,
      isDeceased: true,
      email: true,
    },
  });
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found for the provided deceasedProfileId"
    );
  }

  let statusCode: VerificationStatus = "PENDING";
  if (payload.status === "APPROVED") {
    statusCode = "APPROVED";
  } else if (payload.status === "CHECKING") {
    statusCode = "CHECKING";
  } else if (payload.status === "REJECTED") {
    statusCode = "REJECTED";
  } else if (payload.status === "PENDING") {
    statusCode = "PENDING";
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status value");
  }

  // update the death verification status
  const transaction = await prisma.$transaction(async (prisma) => {
    // update the user's isDeceased status
    const updatedUser = await prisma.user.update({
      where: { userId: user.userId },
      data: {
        isDeceased: payload.status === "APPROVED" ? true : false,
      },
    });
    if (!updatedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    console.log("statusCode ", statusCode);
    // contact list update
    if (statusCode === "CHECKING") {
      // Update all contactList entries for this user to set isDeathNotify to true
      await prisma.contactList.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          isDeathNotify: true,
        },
      });
    }

    const result = await prisma.deathVerification.update({
      where: { id },
      data: { status: statusCode, extraNote: payload.extraNote || "" },
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
