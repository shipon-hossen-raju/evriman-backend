import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { subscriptionsRoutes } from "../modules/subscriptions/subscriptions.route";
import { userRoutes } from "../modules/User/user.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/subscriptions",
    route: subscriptionsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
