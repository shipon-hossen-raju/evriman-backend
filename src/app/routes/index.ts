import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import contactListRouter from "../modules/contactList/contactList.route";
import { deathVerificationRoutes } from "../modules/deathVerification/deathVerification.routes";
import dynamicFieldRoute from "../modules/dynamicField/dynamicField.rotue";
import dynamicUserDataRoute from "../modules/dynamicUserData/dynamicUserData.route";
import { memoryClaimRequestRoutes } from "../modules/memoryClaimRequest/memoryClaimRequest.routes";
import offerCodeRoutes from "../modules/offer_codes/offerCode.route";
import { partnerRoutes } from "../modules/partner/partner.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { subscriptionsRoutes } from "../modules/subscriptions/subscriptions.route";
import tagsRoute from "../modules/tags/tags.rotue";
import { userRoutes } from "../modules/user/user.route";
import userMemoryRoute from "../modules/userMemory/userMemory.route";
import { adminRoutes } from "../modules/admin/admin.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/subscriptions",
    route: subscriptionsRoutes,
  },
  {
    path: "/offer-codes",
    route: offerCodeRoutes,
  },
  {
    path: "/dynamic-fields",
    route: dynamicFieldRoute,
  },
  {
    path: "/dynamic-user-data",
    route: dynamicUserDataRoute,
  },
  {
    path: "/contact-list",
    route: contactListRouter,
  },
  {
    path: "/tag",
    route: tagsRoute,
  },
  {
    path: "/user-memory",
    route: userMemoryRoute,
  },
  {
    path: "/death-verification",
    route: deathVerificationRoutes,
  },
  {
    path: "/memory-claim-request",
    route: memoryClaimRequestRoutes,
  },
  {
    path: "/partner",
    route: partnerRoutes,
  },
  {
    path: "/payment",
    route: paymentRoutes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
