
import { OfferCode } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

type CreateOfferCodeInput = Omit<
  OfferCode,
  "applicablePlans" | "pricingOptionsLevelId"
> & {
  applicablePlans: string[];
  pricingOptionsLevelId?: string[];
};


const createOfferCode = async (payload: CreateOfferCodeInput) => {
  console.log(" service -> ", payload);

  const findOfferCode = await prisma.offerCode.findFirst({
    where: {
      code: payload.code,
    }
  })

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
    },
    include: {
      applicablePlans: true,
      pricingOptionsLevelId: true,
    },
  });

  return newOfferCode;
};

// get All Offer Codes
const getAllOfferCodes = async () => {
  const offerCodes = await prisma.offerCode.findMany({
    include: {
      applicablePlans: true,
      pricingOptionsLevelId: true,
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
      applicablePlans: true,
      pricingOptionsLevelId: true,
    },
  });

  if (!offerCode) {
    throw new ApiError(404, "Offer code not found");
  }

  return offerCode;
};

const offerCodeService = {
  createOfferCode,
  getAllOfferCodes,
  getOfferCodeById
};

export default offerCodeService;
