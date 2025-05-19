const subscriptionPlan = {
  name: "Plan 3",
  contact: 6,
  features: [
    {
      id: 1,
      amount: 10,
      duration: "1 year",
    },
    {
      id: 2,
      amount: 320,
      duration: "lifetime",
    },
  ],
  status: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const subscriptionPlanWithPricing = {
  name: "Plan 3",
  contactLimit: 6,
  isActive: true,
  pricingOptions: [
    {
      id: "1",
      label: "1 Year",
      amount: 49,
      durationInMonths: 12,
    },
    {
      id: "2",
      label: "3 Years",
      amount: 119,
      durationInMonths: 36,
    },
    {
      id: "3",
      label: "Lifetime (55+)",
      amount: 369,
      durationInMonths: null,
      eligibility: {
        minAge: 55,
      },
    },
  ],
};