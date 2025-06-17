import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { PricingOptionInput, SubscriptionPayload } from "./subscription.type";

// create subscription
const createSubscription = async (payload: SubscriptionPayload) => {
  const result = await prisma.subscriptionPlan.create({
    data: {
      name: payload.name,
      contactLimit: payload.contactLimit,
      isActive: payload.isActive ?? true,
      pricingOptions: {
        create: payload.pricingOptions.map((option: PricingOptionInput) => ({
          label: option.label,
          levelId: option.levelId,
          amount: option.amount,
          durationInMonths: option.durationInMonths || null,
          eligibility: option.eligibility || null,
        })),
      },
    },
    include: {
      pricingOptions: true,
    },
  });

  return result;
};

// find all subscriptions
const findAllSubscriptionsPublish = async () => {
  const result = await prisma.subscriptionPlan.findMany({
    where: {
      isActive: true,
    },
    include: {
      pricingOptions: true,
    },
  });

  if (!result.length) {
    throw new ApiError(404, "Subscription not found");
  }

  return result;
};

// find all subscriptions
const findAllSubscriptions = async () => {
  const result = await prisma.subscriptionPlan.findMany({
    include: {
      pricingOptions: true,
    },
  });

  if (!result.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
  }

  return result;
};

// find single subscription
const findSingleSubscription = async (id: string) => {
  const result = await prisma.subscriptionPlan.findUnique({
    where: { id },
    include: {
      pricingOptions: true,
    },
  });

  if (!result) {
    throw new Error("Subscription not found");
  }
  return result;
};

// find & update subscription
const updateSubscription = async (id: string, payload: SubscriptionPayload) => {
  const result = await prisma.subscriptionPlan.findFirst({
    where: { id },
    include: {
      pricingOptions: true,
    },
  });

  if (!result) {
    throw new Error("Subscription not found");
  }

  const updatedResult = await prisma.subscriptionPlan.update({
    where: { id },
    data: {
      name: payload.name,
      contactLimit: payload.contactLimit,
      isActive: payload.isActive ?? true,
      pricingOptions: {
        deleteMany: {
          subscriptionPlanId: id,
        },
        create: payload.pricingOptions.map((option) => ({
          label: option.label,
          levelId: option.levelId,
          amount: option.amount,
          durationInMonths: option.durationInMonths || null,
          eligibility: option.eligibility || null,
        })),
      },
    },
    include: {
      pricingOptions: true,
    },
  });

  return updatedResult;
};

// find & delete subscription
const deleteSubscription = async (id: string) => {
  // First, delete related pricing options
  const pricingOptions = await prisma.pricingOption.deleteMany({
    where: { subscriptionPlanId: id },
  });

  // Then, delete the subscription plan
  const deletedResult = await prisma.subscriptionPlan.delete({
    where: { id },
    include: {
      pricingOptions: true,
    },
  });

  return { deletedResult, pricingOptions };
};

export const subscriptionService = {
  createSubscription,
  findAllSubscriptions,
  findSingleSubscription,
  updateSubscription,
  deleteSubscription,
  findAllSubscriptionsPublish,
};
