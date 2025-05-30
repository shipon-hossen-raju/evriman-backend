import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse";
import { subscriptionService } from "./subscription.service";


// create subscription
const createSubscription = catchAsync(async (req, res) => {
  const result = await subscriptionService.createSubscription(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subscription created successfully",
    data: result,
  });
});

// find all subscriptions
const findAllSubscriptions = catchAsync(async (req, res) => {
  const result = await subscriptionService.findAllSubscriptions();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscriptions retrieved successfully",
    data: result,
  });
});

// find all subscriptions
const findAllSubscriptionsPublish = catchAsync(async (req, res) => {
  const result = await subscriptionService.findAllSubscriptionsPublish();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscriptions retrieved successfully",
    data: result,
  });
});

// find single subscription
const findSingleSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await subscriptionService.findSingleSubscription(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription retrieved successfully",
    data: result,
  });
});

// find & update subscription
const updateSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await subscriptionService.updateSubscription(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription updated successfully",
    data: result,
  });
});

// find & delete subscription
const deleteSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await subscriptionService.deleteSubscription(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription deleted successfully",
    data: result,
  });
});


export const subscriptionsController = {
  createSubscription,
  findAllSubscriptions,
  findSingleSubscription,
  updateSubscription,
  deleteSubscription,
  findAllSubscriptionsPublish,
};
