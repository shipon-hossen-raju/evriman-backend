import { OfferCode } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { sendBulkNotification } from "../notification/notification.utility";

type CreateOfferCodeInput = Omit<
  OfferCode,
  "applicablePlans" | "pricingOptionsLevelId"
> & {
  applicablePlans: string[];
  pricingOptionsLevelId?: string[];
  targetUsers?: string[];
};

const createOfferCode = async (payload: CreateOfferCodeInput) => {
  return await prisma.$transaction(async (tx) => {
    const findOfferCode = await tx.offerCode.findFirst({
      where: {
        code: payload.code,
      },
    });

    if (findOfferCode) {
      throw new ApiError(400, "Offer code already exists");
    }

    let foundUserIds: string[] = [];
    // find & check user
    if (payload.targetUsers?.length) {
      // Check if all target users exist
      const users = await tx.user.findMany({
        where: {
          userId: { in: payload.targetUsers },
        },
        select: { id: true, userId: true },
      });

      foundUserIds = users.map((u) => u.userId);
      const missingUserIds = payload.targetUsers.filter(
        (id) => !foundUserIds.includes(id)
      );

      if (missingUserIds.length > 0) {
        throw new ApiError(
          404,
          `User(s) not found: ${missingUserIds.join(", ")}`
        );
      }
    }

    // find & check plans
    if (payload.applicablePlans && payload.applicablePlans.length) {
      // Check if all applicable plans exist
      const plans = await tx.subscriptionPlan.findMany({
        where: {
          id: { in: payload.applicablePlans },
        },
        select: { id: true },
      });

      const foundPlanIds = plans.map((p) => p.id);
      const missingPlanIds = payload.applicablePlans.filter(
        (id) => !foundPlanIds.includes(id)
      );

      if (missingPlanIds.length > 0) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Subscription plan(s) not found: ${missingPlanIds.join(", ")}`
        );
      }
    }

    // find & check pricing options
    if (payload.pricingOptionsLevelId && payload.pricingOptionsLevelId.length) {
      // Check if all pricing options exist
      const pricingOptions = await tx.pricingOption.findMany({
        where: {
          id: { in: payload.pricingOptionsLevelId },
        },
        select: { id: true },
      });

      const foundPricingOptionIds = pricingOptions.map((p) => p.id);
      const missingPricingOptionIds = payload.pricingOptionsLevelId.filter(
        (id) => !foundPricingOptionIds.includes(id)
      );

      if (missingPricingOptionIds.length > 0) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Pricing option(s) not found: ${missingPricingOptionIds.join(", ")}`
        );
      }
    }

    const newOfferCode = await tx.offerCode.create({
      data: {
        ...payload,
        applicablePlans: {
          create: payload.applicablePlans.map((planId) => ({
            subscriptionPlanId: planId,
          })),
        },
        pricingOptionsLevelId: {
          create:
            payload.pricingOptionsLevelId?.map((pricingOptionId) => ({
              pricingOptionId,
            })) || [],
        },
        targetUsers: {
          create: payload.targetUsers
            ? (
                await tx.user.findMany({
                  where: { userId: { in: payload.targetUsers } },
                  select: { id: true, userId: true },
                })
              ).map((user) => ({
                userId: user.id,
              }))
            : [],
        },
      },
      include: {
        applicablePlans: {
          include: {
            subscriptionPlan: true,
          },
        },
        pricingOptionsLevelId: {
          include: {
            pricingOption: true,
          },
        },
        targetUsers: {
          select: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (foundUserIds.length > 0 || newOfferCode.userType === "SELECTED") {
      // Check if all no notify users
      await sendBulkNotification({
        title: "You’ve received a special gift code!",
        body: `Share this with your family and friends  when they create an account, they’ll get ${newOfferCode.discountValue}${newOfferCode.discountType === "PERCENTAGE" ? "%" : "$"} off on any plan.`,
        type: "SPACIAL_OFFER_YOU",
        receiverIds: foundUserIds,
        dataId: newOfferCode.id,
      });
    }

    if (
      newOfferCode.userType === "ALL"
    ) {
      // Check if all no notify users
      await sendBulkNotification({
        title: "You've received gift code!",
        body: `Share this with your family and friends  when they create an account, they’ll get ${newOfferCode.discountValue}${newOfferCode.discountType === "PERCENTAGE" ? "%" : "$"} off on any plan.`,
        type: "SPACIAL_OFFER",
        dataId: newOfferCode.id,
      });
    }
    if (newOfferCode.userType === "NON_PAID") {

    }


    return newOfferCode;
  });
};

// get All Offer Codes
const getAllOfferCodes = async () => {
  const offerCodes = await prisma.offerCode.findMany({
    where: {
      isActive: true,
    },
    include: {
      applicablePlans: {
        include: {
          subscriptionPlan: true,
        },
      },

      pricingOptionsLevelId: {
        include: {
          pricingOption: true,
        },
      },

      targetUsers: {
        select: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return offerCodes;
};

// get Offer Code by ID
const getOfferCodeById = async (id: string) => {
  const offerCode = await prisma.offerCode.findUnique({
    where: {
      id,
    },
    include: {
      applicablePlans: {
        include: {
          subscriptionPlan: true,
        },
      },
      pricingOptionsLevelId: {
        include: {
          pricingOption: true,
        },
      },
      targetUsers: {
        select: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!offerCode) {
    throw new ApiError(404, "Offer code not found");
  }

  return offerCode;
};

// update offer code
const updateOfferCode = async (id: string, payload: CreateOfferCodeInput) => {
  const existingOfferCode = await prisma.offerCode.findUnique({
    where: { id },
    include: {
      applicablePlans: true,
      pricingOptionsLevelId: true,
      targetUsers: true,
    },
  });

  if (!existingOfferCode) {
    throw new ApiError(404, "Offer code not found");
  }

  // Optional: prevent duplicate code update
  if (payload.code && payload.code !== existingOfferCode.code) {
    const duplicate = await prisma.offerCode.findFirst({
      where: { code: payload.code },
    });
    if (duplicate) {
      throw new ApiError(400, "Offer code already exists");
    }
  }

  // Clear old relations
  await prisma.offerCode.update({
    where: { id },
    data: {
      applicablePlans: { deleteMany: {} },
      pricingOptionsLevelId: { deleteMany: {} },
      targetUsers: { deleteMany: {} },
    },
  });

  // Update offer code with new data
  const updatedOfferCode = await prisma.offerCode.update({
    where: { id },
    data: {
      ...payload,
      applicablePlans: {
        create: payload.applicablePlans.map((planId) => ({
          subscriptionPlanId: planId,
        })),
      },
      pricingOptionsLevelId: {
        create:
          payload.pricingOptionsLevelId?.map((pricingOptionId) => ({
            pricingOptionId,
          })) || [],
      },
      targetUsers: {
        create:
          payload.targetUsers?.map((userId) => ({
            userId,
          })) || [],
      },
    },
    include: {
      applicablePlans: {
        include: {
          subscriptionPlan: true,
        },
      },
      pricingOptionsLevelId: {
        include: {
          pricingOption: true,
        },
      },
      targetUsers: {
        select: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return updatedOfferCode;
};

const offerCodeService = {
  createOfferCode,
  getAllOfferCodes,
  getOfferCodeById,
  updateOfferCode,
};

export default offerCodeService;
