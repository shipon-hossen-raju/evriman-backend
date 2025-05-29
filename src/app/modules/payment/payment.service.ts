import { stripe } from "../../../config/stripe.config";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const createIntoDb = async (data: any) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.payment.create({ data });
    return result;
  });

  return transaction;
};

// create stripe payment intent
const createStripePaymentIntent = async (
  amount: number,
  currency: string = "gbp",
  metadata: Record<string, string> = {}
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });

  return paymentIntent;
};

const findUserAndPartner = async (
  userId: string,
  payload: {
    subscriptionPlanId: string;
    pricingOptionId: string;
    offerCode?: string;
  }
) => {
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
    },
  });

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
  let amount: number = findPricingPOI.amount;

  if (findOfferCode) {
    const discountType = findOfferCode.discountType;

    if (discountType === "PERCENTAGE") {
      amount = amount - amount * (findOfferCode.discountValue / 100);
    } else if (discountType === "FIXED") {
      amount = amount - findOfferCode.discountValue;
    }

    if (amount < 0) amount = 0;
  }

  const userPoint = findUser?.userPoint;
  if (userPoint) amount = amount - amount * (userPoint / 100);

  amount = Math.ceil(amount);
  return {
    subscriptionPlanId: findSPI.id,
    pricingOptionId: findPricingPOI.id,
    ...(findOfferCode?.id && { offerCodeId: findOfferCode.id }),
    findUser,
    amount,
    userPoint: findUser?.userPoint,
  };
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
  findUserAndPartner,
};
