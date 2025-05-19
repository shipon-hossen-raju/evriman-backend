// For Eligibility
export type Eligibility = {
  minAge: number;
};

// For each pricing option
export type PricingOption = {
  id: string;
  label: string;
  amount: number;
  durationInMonths: number | null;
  eligibility?: Eligibility;
};

// Final shape of a Subscription Plan
export type SubscriptionPlanInput = {
  name: string;
  contactLimit: number;
  isActive?: boolean;
  pricingOptions: PricingOption[];
};
