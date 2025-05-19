import prisma from "../../../shared/prisma";
import { SubscriptionPlanInput } from "./subscription.type";

// create subscription
const createSubscription = async (payload: SubscriptionPlanInput) => {

  const result = await prisma.subscriptionPlan.create({
    data: {
      name: payload.name,
      contactLimit: payload.contactLimit,
      isActive: payload.isActive ?? true,
      pricingOptions: {
        data: payload.pricingOptions.map((option, idx) => ({
          id: `${idx + 1}`,
          label: option.label,
          amount: option.amount,
          durationInMonths: option.durationInMonths,
          eligibility: option.eligibility
            ? JSON.stringify(option.eligibility)
            : null,
        })),
      },
    },
  });

  return result;
};

// find all subscriptions
const findAllSubscriptions = async () => {
  const result = await prisma.subscriptionPlan.findMany();

  if (!result.length) {
    throw new Error("Subscription not found");
  }

  return result;
}

// find single subscription
const findSingleSubscription = async (id: string) => {
  const result = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });

  if (!result) {
    throw new Error("Subscription not found");
  }
  return result;
};

// find & update subscription 
const updateSubscription = async (id: string, payload: SubscriptionPlanInput) => {
  const result = await prisma.subscriptionPlan.update({
    where: { id },
    data: {
      name: payload.name,
      contactLimit: payload.contactLimit,
      isActive: payload.isActive ?? true,
      pricingOptions: {
        data: payload.pricingOptions.map((option, idx) => ({
          id: `${idx + 1}`,
          label: option.label,
          amount: option.amount,
          durationInMonths: option.durationInMonths,
          eligibility: option.eligibility
            ? JSON.stringify(option.eligibility)
            : null,
        })),
      },
    },
  });

  return result;
}
 
// find & delete subscription
const deleteSubscription = async (id: string) => {
  const result = await prisma.subscriptionPlan.findFirst({
    where: { id },
  });

  if (!result) {
    throw new Error("Subscription not found");
  }

  const deletedResult = await prisma.subscriptionPlan.delete({
    where: { id },
  });



  return deletedResult;
}

export const subscriptionService = {
  createSubscription,
  findAllSubscriptions,
  findSingleSubscription,
  updateSubscription,
  deleteSubscription,
};
