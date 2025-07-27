import {
  MemoryClaimRequest,
  UserMemory,
  VerificationStatus,
} from "@prisma/client";
import emailSender from "../../../shared/emailSender";
import prisma from "../../../shared/prisma";
import { sendSingleNotification } from "../notification/notification.utility";
import {
  approvedMailGenerate,
  rejectedMailGenerate,
} from "./memoryClaimRequest.mail";

const createIntoDb = async (payload: MemoryClaimRequest) => {
  const user = await prisma.user.findFirst({
    where: {
      userId: payload.deceasedProfileId,
    },
    select: {
      id: true,
    },
  });
  // Validate the data if necessary
  const result = await prisma.memoryClaimRequest.create({
    data: {...payload, userId: user?.id},
    select: {
      id: true,
      deceasedProfileId: true,
      userId: true
    },
  });

  if (result.deceasedProfileId) {
    if (user) {
      // send notification to admin
      await sendSingleNotification({
        dataId: result.id,
        receiverId: user.id,
        title: `Claim Memories Request`,
        type: "MEMORY_CLAIM_REQUEST",
        body: "A new memory claim request has been created",
      });
    }
  }

  return result;
};

const getListFromDb = async () => {
  const result = await prisma.memoryClaimRequest.findMany({});
  return result;
};

const getByIdFromDb = async (id: string) => {
  const memoryClaimRequest = await prisma.memoryClaimRequest.findUnique({
    where: { id },
  });
  if (!memoryClaimRequest) {
    throw new Error("MemoryClaimRequest not found");
  }

  // find user data
  const userData = await prisma.user.findUnique({
    where: { userId: memoryClaimRequest.deceasedProfileId },
    select: {
      userId: true,
      fullName: true,
      email: true,
      isDeceased: true,
      phoneNumber: true,
      address: true,
      dob: true,
      ContactList: {
        where: { email: memoryClaimRequest.claimantEmail },
      },
      memories: {
        where: {
          contactIds: { has: memoryClaimRequest.contactId },
        },
      },
    },
  });
  if (!userData) {
    throw new Error("User not found for the given claim email");
  }

  return { memoryClaimRequest, userData };
};

const updateIntoDb = async (
  id: string,
  payload: { status: VerificationStatus }
) => {
  const existingItem = await prisma.memoryClaimRequest.findUnique({
    where: { id },
  });

  if (!existingItem) {
    throw new Error("MemoryClaimRequest not found");
  }

  // find memory data
  const memoryData = await prisma.userMemory.findFirst({
    where: existingItem.contactId
      ? { contactIds: { has: existingItem.contactId } }
      : undefined,
  });

  if (!memoryData) {
    throw new Error("Memory data not found for the given claim email");
  }

  // Validate the data if necessary
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.memoryClaimRequest.update({
      where: { id },
      data: payload,
    });
    return result;
  });

  // user isDeceased update
  if (payload.status === VerificationStatus.APPROVED) {
    const userUpdate = await prisma.user.update({
      where: { userId: existingItem.deceasedProfileId },
      data: { isDeceased: true },
    });

    // send mail claim request approved
    await emailSender(
      existingItem.claimantEmail,
      approvedMailGenerate(
        memoryData as UserMemory,
        existingItem as MemoryClaimRequest
      ),
      "Your memory claim has been approved"
    );
  } else if (payload.status === VerificationStatus.REJECTED) {
    // send mail claim request rejected
    await emailSender(
      existingItem.claimantEmail,
      rejectedMailGenerate(existingItem as MemoryClaimRequest),
      "Your memory claim has been rejected"
    );
  }

  return { transaction, memoryData };
};

const deleteItemFromDb = async (id: string) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const deletedItem = await prisma.memoryClaimRequest.delete({
      where: { id },
    });

    // Add any additional logic if necessary, e.g., cascading deletes
    return deletedItem;
  });

  return transaction;
};

export const memoryClaimRequestService = {
  createIntoDb,
  getListFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteItemFromDb,
};
