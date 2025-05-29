import prisma from "../../../shared/prisma";

const createIntoDb = async (data: any) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.partnerCode.create({ data });
    return result;
  });

  return transaction;
};

const getListFromDb = async () => {
  const result = await prisma.partnerCode.findMany();
  return result;
};

const getPartnerProfileIntoDb = async (id: string) => {
  const userData = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      businessName: true,
      accountNumber: true,
      accountHolderName: true,
      bankName: true,
      address: true,
      fullName: true,
      role: true,
      loginType: true,
    },
  });

  const partnerCode = await prisma.partnerCode.findUnique({
    where: {
      userId: userData?.id
    },
    select: {
      partnerCode: true
    }
  });

  const usersLinked = await prisma.user.findMany({
    where: {
      referralCodeUsed: partnerCode?.partnerCode
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      userImage: true,
    }
  });

  // user refer linked count
  const usersLinkedCount = await prisma.user.count({
    where: {
      referralCodeUsed: partnerCode?.partnerCode
    }
  });

  const result = {
    userData,
    partnerCode,
    usersLinked,
    usersLinkedCount,
  };

  return result;
};

const getByIdFromDb = async (id: string) => {
  const result = await prisma.partnerCode.findUnique({ where: { id } });
  if (!result) {
    throw new Error("Partner not found");
  }
  return result;
};

const updateIntoDb = async (id: string, data: any) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.partnerCode.update({
      where: { id },
      data,
    });
    return result;
  });

  return transaction;
};

const deleteItemFromDb = async (id: string) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const deletedItem = await prisma.partnerCode.delete({
      where: { id },
    });

    // Add any additional logic if necessary, e.g., cascading deletes
    return deletedItem;
  });

  return transaction;
};
export const partnerService = {
  createIntoDb,
  getListFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteItemFromDb,
  getPartnerProfileIntoDb,
};
