import { OfferCode } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

type CreateOfferCodeInput = Omit<
  OfferCode,
  "applicablePlans" | "pricingOptionsLevelId"
> & {
  applicablePlans: string[];
  pricingOptionsLevelId?: string[];
  targetUsers?: string[];
};

const createOfferCode = async (payload: CreateOfferCodeInput) => {

  const findOfferCode = await prisma.offerCode.findFirst({
    where: {
      code: payload.code,
    },
  });

  if (findOfferCode) {
    throw new ApiError(400, "Offer code already exists");
  }

  const newOfferCode = await prisma.offerCode.create({
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
        create: payload.targetUsers?.map((userId) => ({
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

  return newOfferCode;
};

// get All Offer Codes
const getAllOfferCodes = async () => {

  const offerCodes = await prisma.offerCode.findMany({
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
            }
          }
        }
      }
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
