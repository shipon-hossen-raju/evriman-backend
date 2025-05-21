export type IOfferCodeFilterRequest = {
  code?: string | undefined;
  discountType?: string | undefined;
  userType?: string | undefined;
  expiresAt?: Date | undefined;
  pricingOptionsLevelId?: string | undefined;
};
