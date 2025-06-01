import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
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

const usersLinkedIntoDb = async (id: string) => {
  const userData = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  // Partner code
  const partnerCode = await prisma.partnerCode.findUnique({
    where: {
      userId: userData?.id,
    },
    select: {
      partnerCode: true,
    },
  });

  // user links
  const usersLinked = await prisma.user.findMany({
    where: {
      referralCodeUsed: partnerCode?.partnerCode,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      userImage: true,
      createdAt: true,
    },
  });

  // user refer linked count
  const usersLinkedCount = await prisma.user.count({
    where: {
      referralCodeUsed: partnerCode?.partnerCode,
    },
  });


  const result = {
    usersLinkedCount,
    usersLinked,
  };

  return result;
};

// view profile
const viewProfileIntoDb = async (profileId: string) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: profileId,
    },
    select: {
      id: true
    },
  });
  
  const partnerCode = await prisma.partnerCode.findUnique({
    where: {
      userId: userData?.id,
    },
    select: {
      partnerCode: true,
    },
  });

  const user = await prisma.user.findFirst({
    where: {
      referralCodeUsed: partnerCode?.partnerCode,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      userImage: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // find payment data
  const paymentHistory = await prisma.payment.findFirst({
    where: {
      userId: user.id,
      status: "COMPLETED"
    },
    include: {
      subscriptionPlan: true,
      pricingOption: true
    }
  });

  return { user, paymentHistory };
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

  // Partner code
  const partnerCode = await prisma.partnerCode.findUnique({
    where: {
      userId: userData?.id,
    },
    select: {
      partnerCode: true,
    },
  });

  // user links
  const usersLinked = await prisma.user.findMany({
    where: {
      referralCodeUsed: partnerCode?.partnerCode,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      userImage: true,
      createdAt: true
    },
  });

  // user refer linked count
  const usersLinkedCount = await prisma.user.count({
    where: {
      referralCodeUsed: partnerCode?.partnerCode,
    },
  });

  // my wallet & calculate commission
  const myWallet = await prisma.payment.findMany({
    where: {
      userUsedReferCode: partnerCode?.partnerCode,
      status: "COMPLETED",
    },
    select: {
      commissionAmount: true,
    },
  });
  const calculateCommission = myWallet.reduce((total, payment) => {
    // Assuming each payment object has a 'commission' field
    return total + (payment.commissionAmount || 0);
  }, 0);

  // find active plans
  const findUserActivePlanCount = await prisma.payment.count({
    where: {
      user: {
        referralCodeUsed: partnerCode?.partnerCode,
      },
      status: "COMPLETED",
    },
  });

  // year signup
  const currentYear = new Date().getFullYear();
  const yearSignUp = usersLinked.filter(user => {
    const createdAtYear = new Date(user.createdAt).getFullYear();
    return createdAtYear === currentYear;
  }).length;

  // remaining date to next payout (always Dec 1st)
  const today = new Date();
  const currentYearDecFirst = new Date(today.getFullYear(), 11, 1); // December is month 11 (0-indexed)
  let nextPayoutDate: Date;

  if (today < currentYearDecFirst) {
    nextPayoutDate = currentYearDecFirst;
  } else {
    nextPayoutDate = new Date(today.getFullYear() + 1, 11, 1);
  }

  const msInDay = 1000 * 60 * 60 * 24;
  const daysToPayout = Math.ceil((nextPayoutDate.getTime() - today.getTime()) / msInDay);

  const result = {
    userData,
    partnerCode,
    usersLinked,
    usersLinkedCount,
    myWallet: calculateCommission,
    activePlanCount: findUserActivePlanCount,
    yearSignUp,
    daysToPayout,
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
  usersLinkedIntoDb,
  viewProfileIntoDb,
};
