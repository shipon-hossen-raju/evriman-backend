import prisma from "../../../shared/prisma";

// const createIntoDb = async (data: any) => {
//   const transaction = await prisma.$transaction(async (prisma) => {
//     const result = await prisma.admin.create({ data });
//     return result;
//   });

//   return transaction;
// };

const getAdminHome = async () => {
  // user
  const { usersAndCount } = await totalSalesIntoDb();

  // sales Performance
  const salesUserCount = usersAndCount.reduce(
    (priv, cur) => priv + cur.userCount,
    0
  );

  // user Count
  const usersCount = await prisma.user.count({
    where: {
      isUser: true,
    },
  });

  // App Management
  const appManagement = "03";

  // manage partners
  const managePartners = await prisma.user.count({
    where: {
      role: "PARTNER",
      isPartner: true,
    },
  });

  // partner request
  const partnerRequest = await prisma.user.count({
    where: {
      isPartner: true,
      role: "USER",
    },
  });

  // manage subscriptions
  const subscriptionPlan = await prisma.subscriptionPlan.count({});

  // death verification
  const deathVerification = await prisma.deathVerification.count({});

  // claim memories
  const claimMemories = await prisma.memoryClaimRequest.count({});

  //

  return {
    salesPerformance: salesUserCount,
    manageUsers: usersCount,
    appManagement,
    managePartners,
    partnerRequest,
    subscriptionPlan,
    deathVerification,
    claimMemories,
  };
};

const totalSalesIntoDb = async ({
  year,
  plan,
}: { year?: string; plan?: string } = {}) => {
  const whereClause: any = {
    status: {
      in: ["EXPIRED", "COMPLETED"],
    },
  };

  // Filter by year
  if (year && year !== "All Year") {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${+year + 1}-01-01T00:00:00.000Z`);
    whereClause.createdAt = {
      gte: startDate,
      lt: endDate,
    };
  }

  // Filter by plan
  if (plan && plan !== "All Plan") {
    whereClause.pricingOption = {
      label: {
        contains: plan.replace(" Plan", ""), // e.g., "3 Year" from "3 Year Plan"
        mode: "insensitive",
      },
    };
  }

  const payments = await prisma.payment.findMany({
    where: whereClause,
    select: {
      amountPay: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      status: true,
      subscriptionPlan: {
        select: {
          id: true,
          name: true,
        },
      },
      pricingOption: {
        select: {
          id: true,
          amount: true,
          durationInMonths: true,
          eligibility: true,
          label: true,
        },
      },
      userId: true,
    },
  });

  if (!payments) throw new Error("Payment not found");

  const total = payments.reduce((sum, p) => sum + (p.amountPay ?? 0), 0);

  // Group by pricingOptionId and count unique users for each pricing option
  const pricingUser = Object.values(
    payments.reduce<
      Record<string, { pricingOptionId: string; userIds: Set<string> }>
    >((acc, payment) => {
      const pricingOptionId = payment.pricingOption?.id;
      const userId = payment.userId;
      if (pricingOptionId && userId) {
        if (!acc[pricingOptionId]) {
          acc[pricingOptionId] = { pricingOptionId, userIds: new Set() };
        }
        acc[pricingOptionId].userIds.add(userId);
      }
      return acc;
    }, {})
  );
  // Find unique pricing options from the payments
  const pricingOptions = [
    ...new Map(
      payments
        .filter((p) => p.pricingOption)
        .map((p) => [p.pricingOption!.id, p.pricingOption])
    ).values(),
  ];
  const usersAndCount = pricingUser.map(({ pricingOptionId, userIds }) => {
    const pricingOption = pricingOptions.find(
      (po) => po?.id === pricingOptionId
    );
    // Find the first payment with this pricingOptionId to get the subscriptionPlan
    const paymentWithPlan = payments.find(
      (p) => p.pricingOption?.id === pricingOptionId
    );

    return {
      userCount: userIds.size,
      pricingOption,
      subscriptionPlan: paymentWithPlan?.subscriptionPlan || null,
    };
  });

  return { usersAndCount, total };
};

const partnerManageIntoDb = async (topSales: string, limit: number) => {
  // manage partners
  const allPartnersCount = await prisma.user.count({
    where: {
      role: "PARTNER",
      isPartner: true,
    },
  });

  type PartnerWithCode = {
    id: string;
    userId: string;
    partnerImage: string;
    businessName: string | null;
    fullName: string;
    phoneNumber: string;
    address: string | null;
    bankName: string | null;
    accountHolderName: string | null;
    shortCode: string | null;
    accountNumber: string | null;
    partnerCode?: string | null;
    usersLinkedCount?: number;
    currentBalance?: number;
  };

  const allPartners: PartnerWithCode[] = await prisma.user.findMany({
    where: {
      role: "PARTNER",
      isPartner: true,
    },
    select: {
      id: true,
      userId: true,
      partnerImage: true,
      businessName: true,
      fullName: true,
      phoneNumber: true,
      address: true,
      bankName: true,
      accountHolderName: true,
      shortCode: true,
      accountNumber: true,
      partnerType: true,
    },
    // take: limit,
  });

  if (!allPartners) throw new Error("Partners not found");

  // Partner code
  const partnerCodes = await prisma.partnerCode.findMany({
    where: {
      userId: {
        in: allPartners.map((p) => p.id),
      },
    },
    select: {
      userId: true,
      partnerCode: true,
    },
  });
  const partnerCodeMap = new Map(
    partnerCodes.map((pc) => [pc.userId, pc.partnerCode])
  );

  // For each partner, calculate commission (currentBalance) and usersLinkedCount
  for (const partner of allPartners) {
    const partnerCode = partnerCodeMap.get(partner.id) || null;
    (partner as any).partnerCode = partnerCode;

    // Calculate users linked count
    const usersLinkedCount = await prisma.user.count({
      where: {
        referralCodeUsed: partnerCode,
      },
    });
    (partner as any).usersLinkedCount = usersLinkedCount;

    // Calculate current balance (commission)
    const userWallet = await prisma.payment.findMany({
      where: {
        userUsedReferCode: partnerCode,
        status: "COMPLETED",
      },
      select: {
        commissionAmount: true,
      },
    });
    const currentBalance = userWallet.reduce((total, payment) => {
      return total + (payment.commissionAmount || 0);
    }, 0);
    (partner as any).currentBalance = currentBalance;
  }

  let partnerData = [];
  if (topSales === "true") {
    partnerData = allPartners
      .sort((a, b) => (b.currentBalance ?? 0) - (a.currentBalance ?? 0))
      .filter((p) => p.currentBalance !== 0)
      .slice(0, limit);
  } else {
    partnerData = allPartners.sort(
      (a, b) => (a.currentBalance ?? 0) - (b.currentBalance ?? 0)
    );
  }

  return {
    limit: limit,
    allPartnersCount,
    allPartners: partnerData,
  };
};

const partnerSingleProfileIntoDb = async ({
  profileId,
}: {
  profileId: string;
}) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: profileId,
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
      partnerType: true,
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

  // find active plans
  const userActivePlanCount = await prisma.payment.findMany({
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
    ...new Set(userActivePlanCount.map((p) => p.subscriptionPlanId)),
  ];

  // Current year commission
  const userWallet = await prisma.payment.findMany({
    where: {
      userUsedReferCode: partnerCode?.partnerCode,
      status: "COMPLETED",
      createdAt: {
        gte: new Date(new Date().getFullYear(), 0, 1),
        lt: new Date(new Date().getFullYear() + 1, 0, 1),
      },
    },
    select: {
      commissionAmount: true,
    },
  });
  const calculateCommission = userWallet.reduce((total, payment) => {
    return total + (payment.commissionAmount || 0);
  }, 0);

  // Previous year commission
  const prevYear = new Date().getFullYear() - 1;
  const prevYearWallet = await prisma.payment.findMany({
    where: {
      userUsedReferCode: partnerCode?.partnerCode,
      status: "COMPLETED",
      createdAt: {
        gte: new Date(prevYear, 0, 1),
        lt: new Date(prevYear + 1, 0, 1),
      },
    },
    select: {
      commissionAmount: true,
    },
  });
  const previousYearCommission = prevYearWallet.reduce((total, payment) => {
    return total + (payment.commissionAmount || 0);
  }, 0);

  return {
    previousYearCommission,
    usersLinkedCount,
    userActivePlanCount: uniqueSubscriptionPlanIds.length,
    currentBalance: calculateCommission,
    userData: {
      ...userData,
      partnerCode: partnerCode?.partnerCode,
    },
  };
};

// admin notification
const getAdminNotification = async () => {
  // Find pending death verification requests
  const pendingDeathVerifications = await prisma.deathVerification.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Find partner requests (users who requested to become partners)
  const partnerRequests = await prisma.user.findMany({
    where: {
      isPartner: true,
      role: "USER",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Find pending memory claim requests
  const pendingClaimMemories = await prisma.memoryClaimRequest.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // find subscription payment plan by user
  const paymentSubscription = await prisma.payment.findMany({
    where: {
      status: "COMPLETED",
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          userImage: true,
        },
      },
      subscriptionPlan: {
        select: {
          id: true,
          name: true,
        },
      },
      pricingOption: {
        select: {
          durationInMonths: true,
          amount: true,
          label: true,
          eligibility: true,
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Optionally, count unread or new notifications
  const notificationCounts = {
    pendingDeathVerifications: pendingDeathVerifications.length,
    partnerRequests: partnerRequests.length,
    pendingClaimMemories: pendingClaimMemories.length,
    paymentSubscription: paymentSubscription.length,
  };

  return {
    notificationCounts,
    pendingDeathVerifications,
    partnerRequests,
    pendingClaimMemories,
    paymentSubscription,
  };
};

export const adminService = {
  getAdminHome,
  totalSalesIntoDb,
  partnerManageIntoDb,
  partnerSingleProfileIntoDb,
  getAdminNotification,
};
