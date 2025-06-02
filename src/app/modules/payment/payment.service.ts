import { PaymentStatus } from "@prisma/client";
import { stripe } from "../../../config/stripe.config";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { dateOutput } from "../../../utils/date";

const createIntoDb = async (data: any) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.payment.create({ data });
    return result;
  });

  return transaction;
};

const createPaymentRequest = async (
  userId: string,
  payload: {
    subscriptionPlanId: string;
    pricingOptionId: string;
    offerCode?: string;
  }
) => {
  return await prisma.$transaction(async (prisma) => {
    const findSPI = await prisma.subscriptionPlan.findUnique({
      where: { id: payload.subscriptionPlanId },
      select: {
        id: true,
        contactLimit: true,
      },
    });
    const findPricingPOI = await prisma.pricingOption.findUnique({
      where: { id: payload.pricingOptionId },
      select: {
        eligibility: true,
        amount: true,
        id: true,
        durationInMonths: true,
      },
    });
    const findUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
        referralCodeUsed: true,
        userPoint: true,
        email: true,
        partnerCodeId: true,
      },
    });

    let referralUserFind: {
      referType: "user" | "partner";
      id: string;
    } = {
      referType: "user",
      id: "",
    };
    if (findUser?.referralCodeUsed) {
      const findReferUser = await prisma.user.findUnique({
        where: {
          referralCode: findUser?.referralCodeUsed,
        },
        select: {
          id: true,
          role: true,
          email: true,
          referralCode: true,
          referralCodeUsed: true,
        },
      });
      if (findReferUser) {
        referralUserFind = { referType: "user", id: findReferUser.id };
      }

      const findReferPartner = await prisma.partnerCode.findUnique({
        where: {
          partnerCode: findUser?.referralCodeUsed,
        },
      });
      if (findReferPartner) {
        referralUserFind = { referType: "partner", id: findReferPartner.id };
      }
    }

    let findOfferCode = null;
    if (payload.offerCode) {
      findOfferCode = await prisma.offerCode.findUnique({
        where: {
          code: payload.offerCode,
          isActive: true,
        },
        select: {
          code: true,
          id: true,
          userType: true,
          discountType: true,
          discountValue: true,
        },
      });
    }

    // check data
    if (!findSPI || !findPricingPOI) {
      throw new ApiError(404, "Data Not Fount");
    }
    if (!findOfferCode && payload.offerCode) {
      throw new ApiError(404, "Offer Data Not Fount");
    }
    let amount: number = findPricingPOI.amount;

    // if offer code
    let offerCodeAmount = 0;
    if (findOfferCode) {
      const discountType = findOfferCode.discountType;

      if (discountType === "PERCENTAGE") {
        offerCodeAmount = amount * (findOfferCode.discountValue / 100);
        amount = amount - offerCodeAmount;
      } else if (discountType === "FIXED") {
        amount = amount - findOfferCode.discountValue;
        offerCodeAmount = findOfferCode.discountValue;
      }

      if (amount < 0) amount = 0;
    }

    const userPoint = findUser?.userPoint;

    let useUserPoint;
    let amountUserPoint;

    // if user point
    if (userPoint) {
      if (userPoint <= 100) {
        // point calculate
        const userPointAmount = amount * (userPoint / 100);
        useUserPoint = userPoint;
        amountUserPoint = userPointAmount;
        amount = amount - userPointAmount;
      } else if (userPoint >= 100) {
        amount = amount - amount * (100 / 100);
        useUserPoint = 100;
        amountUserPoint = amount;
      }
    }

    amount = Number(amount.toFixed(2));

    const metadata: Record<string, string> = {
      subscriptionPlanId: String(findSPI.id),
      pricingOptionId: String(findPricingPOI.id),
      userId: findUser?.id ?? "",
      ...(findOfferCode?.id && { offerCodeId: String(findOfferCode.id) }),
      ...(typeof useUserPoint !== "undefined" && {
        useUserPoint: String(useUserPoint),
      }),
      ...(typeof findUser?.referralCodeUsed !== "undefined" &&
        findUser?.referralCodeUsed !== null && {
          userUsedReferCode: String(findUser.referralCodeUsed),
        }),
    };

    // Commission logic
    let commissionType: "REFERRAL" | "PARTNER" = "REFERRAL";
    let commissionAmount: number = 0;
    let commissionReceiverId: string = "";

    // If user is a partner, give 25% commission to partner
    if (referralUserFind.referType === "partner") {
      commissionType = "PARTNER";
      commissionAmount = Number((amount * 0.25).toFixed(2));
      commissionReceiverId = referralUserFind.id;
    }
    // Else, if user used a referral code, give referral point (handled elsewhere, but can set commission fields)
    else if (referralUserFind.referType === "user") {
      commissionType = "REFERRAL";
      commissionAmount = 0;
      commissionReceiverId = referralUserFind.id;
    }

    // store subscription
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(
      endDate.getMonth() + (findPricingPOI.durationInMonths || 0)
    );

    const storeDatabase = {
      ...metadata,
      currency: "gbp",
      contactLimit: findSPI.contactLimit,
      useUserPoint: useUserPoint,
      amountPay: amount,
      amountPricing: findPricingPOI.amount,
      amountOfferCode: Number(offerCodeAmount.toFixed(2)),
      amountUserPoint: Number(amountUserPoint?.toFixed(2)),
      stripePaymentIntentId: "",
      startDate,
      endDate,
      commissionType,
      commissionAmount,
      commissionReceiverId,
      subscriptionPlanId: findSPI.id,
      pricingOptionId: findPricingPOI.id,
      userId: findUser?.id ?? "",
      offerCodeId: findOfferCode?.id,
    };

    // const {
    //   subscriptionPlanId,
    //   pricingOptionId,
    //   userId: userIdFromStore,
    //   offerCodeId,
    //   ...restStoreDatabase
    // } = storeDatabase;

    const storedData = await prisma.payment.create({
      data: {
        ...storeDatabase,
        status: "PENDING",
      },
    });

    return {
      ...storedData,
      startDate: dateOutput(storedData.startDate),
      endDate: dateOutput(storedData.endDate),
    };
  });
};

// create stripe payment intent
const createStripePaymentIntent = async (
  amount: number,
  currency: string = "gbp",
  metadata: Record<string, string> = {}
) => {
  // Convert to smallest currency unit (e.g. pence)
  const integerAmount = Math.round(amount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: integerAmount,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });

  return paymentIntent;
};

const getListFromDb = async () => {
  const result = await prisma.payment.findMany();
  return result;
};

const getByIdFromDb = async (id: string) => {
  const result = await prisma.payment.findUnique({ where: { id } });
  if (!result) {
    throw new Error("Payment not found");
  }
  return result;
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

  const userTest = pricingUser.map(({ pricingOptionId, userIds }) => {
    const pricingOption = pricingOptions.find((po) => po?.id === pricingOptionId);
    return {
      userCount: userIds.size,
      pricingOption,
    };
  });

  return { userTest, total };
};

const updateIntoDb = async (id: string, data: any) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.payment.update({
      where: { id },
      data,
    });
    return result;
  });

  return transaction;
};
const paymentConfirmIntoDb = async (payload: {
  id: string;
  status: PaymentStatus;
  subscriptionPlanId: string;
}) => {
  if (!payload.id) {
    throw new ApiError(400, "Payment Id is required!");
  }

  const findPayment = await prisma.payment.findUnique({
    where: { id: payload.id },
  });

  if (!findPayment) throw new ApiError(404, "Payment Data not fount!");

  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.payment.update({
      where: { id: payload.id },
      data: {
        status: payload.status,
      },
    });

    if (payload.status === "COMPLETED") {
      // find user
      const findUser = await prisma.user.findUnique({
        where: {
          id: findPayment.userId,
        },
        select: {
          id: true,
          role: true,
          referralCodeUsed: true,
          userPoint: true,
          email: true,
          contactLimit: true,
        },
      });

      // user update
      const userUpdate = await prisma.user.update({
        where: {
          id: result.userId,
        },
        data: {
          isPaid: true,
          contactLimit: findPayment.contactLimit,
          userPoint: Math.max(
            (findUser?.userPoint ?? 0) - (findPayment?.useUserPoint ?? 0),
            0
          ),
        },
      });

      // used referral partner commission 25% divide
      if (findPayment.userUsedReferCode) {
        // Find the user who owns the referral code
        const referralUser = await prisma.user.findFirst({
          where: { referralCodeUsed: findPayment.userUsedReferCode },
          select: { id: true, userPoint: true },
        });
      }
    } else {
      await prisma.user.update({
        where: {
          id: result.userId,
        },
        data: {
          isPaid: false,
        },
      });
    }

    return result;
  });

  return transaction;
};

const deleteItemFromDb = async (id: string) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const deletedItem = await prisma.payment.delete({
      where: { id },
    });

    // Add any additional logic if necessary, e.g., cascading deletes
    return deletedItem;
  });

  return transaction;
};

export const paymentService = {
  createIntoDb,
  getListFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteItemFromDb,

  createStripePaymentIntent,
  createPaymentRequest,
  paymentConfirmIntoDb,
  totalSalesIntoDb,
};
