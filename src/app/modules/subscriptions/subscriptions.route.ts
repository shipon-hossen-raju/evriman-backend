import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { subscriptionPlanSchema, UpdateSubscriptionPlanSchema } from "./subscription.validation";
import { subscriptionsController } from "./subscriptions.controller";
const router = express.Router();

// create subscription
router.post(
  "/created",
  validateRequest(subscriptionPlanSchema),
  subscriptionsController.createSubscription
);

// find all subscriptions
router.get("/", subscriptionsController.findAllSubscriptions);

// find single subscription
router.get("/:id", subscriptionsController.findSingleSubscription);

// find & update subscription
router.patch(
  "/:id",
  validateRequest(UpdateSubscriptionPlanSchema),
  subscriptionsController.updateSubscription
);

// find & delete subscription
router.delete("/:id", subscriptionsController.deleteSubscription);

// export subscription routes
export const subscriptionsRoutes = router;
