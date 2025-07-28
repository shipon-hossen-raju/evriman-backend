import { DeathVerification, VerificationStatus } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { sendSingleNotification } from "../notification/notification.utility";

// create a new death verification record
const createIntoDb = async (payload: DeathVerification) => {
  const result = await prisma.deathVerification.create({
    data: payload,
    select: { id: true, deceasedProfileId: true },
  });

  if (result.deceasedProfileId) {
    const profileId = result.deceasedProfileId;
    const user = await prisma.user.findUnique({
      where: {
        userId: profileId,
      },
      select: {
        id: true,
      },
    });
    if (!user) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "User not found for the provided deceasedProfileId"
      );
    }
    // send notification to admin
    await sendSingleNotification({
      dataId: result.id,
      receiverId: user.id,
      title: "Death verification Request.",
      type: "DEATH_VERIFICATION",
      body: "We have received notification of your death. If this is incorrect, please contact us within 72 hours",
    });
  }

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
      `DeathVerification status is already set to ${payload.status}`
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
      fullName: true,
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

      // send notification & mail
      await sendSingleNotification({
        dataId: id,
        receiverId: user.id,
        title: "Death Verification",
        type: "YOU_ARE_DEAD",
        body: "We have received notification of your death. If this is incorrect, please contact us within 72 hours",
      });

      // Fetch updated contact list entries to notify each contact
      const updatedContacts = await prisma.contactList.findMany({
        where: {
          userId: user.id,
          isDeathNotify: true,
        },
        select: {
          id: true,
          userId: true,
          name: true,
        },
      });

      for (const contact of updatedContacts) {
        await sendSingleNotification({
          dataId: contact.id,
          receiverId: contact.userId,
          title: `${user.fullName} has reported the death of ${contact.name} Can you confirm?`,
          type: "CONTACT_VERIFICATION",
          body: "We have received notification of your death. If this is incorrect, please contact us within 72 hours",
        });
      }


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
