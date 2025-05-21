import { LevelId } from "@prisma/client";

// For Eligibility
export type Eligibility = {
  minAge: number;
};


export type PricingOptionInput = {
  label: string;
  levelId: LevelId;
  amount: number;
  durationInMonths?: number;
  eligibility?: {
    minAge: number;
  };
};

export type SubscriptionPayload = {
  name: string;
  contactLimit: number;
  isActive?: boolean;
  pricingOptions: PricingOptionInput[];
};