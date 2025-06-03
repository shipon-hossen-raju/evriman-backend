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
      subscriptionPlan: true,
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
    return {
      userCount: userIds.size,
      pricingOption,
    };
  });

  return { usersAndCount, total };
};
const partnerManageIntoDb = async ({
  topSales,
}: { topSales?: Boolean } = {}) => {
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
    }
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

  allPartners.forEach((partner) => {
    (partner as any).partnerCode = partnerCodeMap.get(partner.id) || null;
  });

  // Find total commission amount grouped by commissionReceiverId
  const partnerCommissions = await prisma.payment.groupBy({
    by: ["commissionReceiverId"],
    where: {
      commissionReceiverId: {
        in: allPartners.map((code) => code.id),
      },
    },
    _sum: {
      commissionAmount: true,
    },
  });
  
  // find total users linked by partnerCode
  // const linkedUserCountByPartnerCode = await prisma.user.findMany({
  //   where: {
  //     referralCodeUsed: {
  //       in: allPartners.map((partner) => partner.partnerCode),
  //     },
  //   },
  // });

  console.log(" partnerCommission ", partnerCommissions);

  // Map commissionReceiverId to commissionAmount
  const partnerAmountFind = partnerCommissions.map((item) => ({
    commissionReceiverId: item.commissionReceiverId,
    commissionAmount: item._sum.commissionAmount ?? 0,
  }));

  return {
    allPartnersCount,
    allPartners: allPartners,
    partnerAmountFind,
  };
};

export const adminService = {
  getAdminHome,
  totalSalesIntoDb,
  partnerManageIntoDb,
};
