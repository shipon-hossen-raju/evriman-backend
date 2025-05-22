import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import dynamicFieldRoute from "../modules/dynamicField/dynamicField.rotue";
import offerCodeRoutes from "../modules/offer_codes/offerCode.route";
import { subscriptionsRoutes } from "../modules/subscriptions/subscriptions.route";
import { userRoutes } from "../modules/user/user.route";
import dynamicUserDataRoute from "../modules/dynamicUserData/dynamicUserData.route";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
