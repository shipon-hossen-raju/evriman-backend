import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { subscriptionPlanSchema, subscriptionPlanUpdateSchema } from "./subscription.validation";
import { subscriptionsController } from "./subscriptions.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const router = express.Router();

// create subscription
router.post(
  "/created",
  auth(UserRole.ADMIN),
  validateRequest(subscriptionPlanSchema),
  subscriptionsController.createSubscription
);

// find all subscriptions
router.get("/", auth(UserRole.ADMIN), subscriptionsController.findAllSubscriptions);

// find all subscriptions publish
router.get(
  "/publish",
  auth(),
  subscriptionsController.findAllSubscriptionsPublish
);

// find single subscription
router.get("/:id", auth(), subscriptionsController.findSingleSubscription);

// find & update subscription
router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(subscriptionPlanUpdateSchema),
  subscriptionsController.updateSubscription
);

// find & delete subscription
router.delete("/:id", auth(UserRole.ADMIN), subscriptionsController.deleteSubscription);

// export subscription routes
export const subscriptionsRoutes = router;
