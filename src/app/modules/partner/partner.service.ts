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
      userId: true,
      fullName: true,
      email: true,
      userImage: true,
      createdAt: true,
      address: true,
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
      id: true,
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

  const user = await prisma.user.findUnique({
    where: {
      // referralCodeUsed: partnerCode?.partnerCode,
      id: profileId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      userImage: true,
      createdAt: true,
      userId: true,
      phoneNumber: true,
      address: true,
      contactLimit: true,
      ContactList: true,
      _count: {
        select: {
          ContactList: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // find last payment data
  const paymentHistory = await prisma.payment.findFirst({
    where: {
      userId: user?.id,
    },
    select: {
      id: true,
      amountPay: true,
      startDate: true,
      endDate: true,
      contactLimit: true,
      createdAt: true,
      pricingOption: {
        select: {
          id: true,
          label: true,
          amount: true,
          eligibility: true,
        },
      },
      subscriptionPlan: {
        select: {
          id: true,
          name: true,
          contactLimit: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return { user, paymentHistory };
};

// active plans
const activePlansIntoDb = async (id: string) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
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

  const users = await prisma.user.findMany({
    where: {
      referralCodeUsed: partnerCode?.partnerCode,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      userImage: true,
      partnerImage: true,
      createdAt: true,
    },
  });

  const usersCount = await prisma.user.count({
    where: {
      referralCodeUsed: partnerCode?.partnerCode,
    },
  });

  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return { users, usersCount };
};

// year signup users
const yearSignUpIntoDb = async (id: string) => {
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
      createdAt: true,
    },
  });

  // year signup
  const currentYear = new Date().getFullYear();
  const yearSignUp = usersLinked.filter((user) => {
    const createdAtYear = new Date(user.createdAt).getFullYear();
    return createdAtYear === currentYear;
  });
  const createdAtYearCount = usersLinked.filter((user) => {
    const createdAtYear = new Date(user.createdAt).getFullYear();
    return createdAtYear === currentYear;
  }).length;

  const result = {
    partnerCode,
    createdAtYearCount,
    yearSignUp,
  };

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
      phoneNumber: true,
      businessName: true,
      accountNumber: true,
      accountHolderName: true,
      bankName: true,
      shortCode: true,
      address: true,
      fullName: true,
      role: true,
      loginType: true,
      partnerImage: true,
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

  // user refer linked count
  const usersLinkedCount = await prisma.user.count({
    where: {
      referralCodeUsed: partnerCode?.partnerCode,
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
  const findUserActivePlanCount = await prisma.payment.findMany({
    where: {
      user: {
        referralCodeUsed: partnerCode?.partnerCode,
      },
      status: "COMPLETED",
    },
    select: {
      subscriptionPlanId: true,
    },
  });
  // To get unique subscriptionPlanIds:
  const uniqueSubscriptionPlanIds = [
    ...new Set(findUserActivePlanCount.map((p) => p.subscriptionPlanId)),
  ];

  // year signup
  const currentYear = new Date().getFullYear();
  const yearSignUp = usersLinked.filter((user) => {
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
  const daysToPayout = Math.ceil(
    (nextPayoutDate.getTime() - today.getTime()) / msInDay
  );

  const result = {
    userData,
    partnerCode,
    usersLinked,
    usersLinkedCount,
    myWallet: calculateCommission,
    activePlanCount: uniqueSubscriptionPlanIds?.length || 0,
    yearSignUp,
    daysToPayout,
  };

  return result;
};

const myWalletIntoDb = async (id: string) => {
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

  // my wallet & calculate commission
  const myWallet = await prisma.payment.findMany({
    where: {
      userUsedReferCode: partnerCode?.partnerCode,
      status: "COMPLETED",
    },
    select: {
      commissionAmount: true,
      createdAt: true,
    },
  });

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  let currentYearBalance = 0;
  let previousYearBalance = 0;

  myWallet.forEach((payment) => {
    const paymentYear = new Date(payment.createdAt).getFullYear();
    if (paymentYear === currentYear) {
      currentYearBalance += payment.commissionAmount || 0;
    } else if (paymentYear === previousYear) {
      previousYearBalance += payment.commissionAmount || 0;
    }
  });

  const calculateCommission = myWallet.reduce((total, payment) => {
    return total + (payment.commissionAmount || 0);
  }, 0);

  const result = {
    partnerCode,
    myWallet: calculateCommission,
    currentYearBalance,
    previousYearBalance,
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
  myWalletIntoDb,
  activePlansIntoDb,
  yearSignUpIntoDb,
};
