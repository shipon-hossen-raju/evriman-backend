import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { paymentService } from "./payment.service";

const createPayment = catchAsync(async (req, res) => {
  const result = await paymentService.createIntoDb(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment created successfully",
    data: result,
  });
});

const getPaymentList = catchAsync(async (req, res) => {
  const result = await paymentService.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment list retrieved successfully",
    data: result,
  });
});

const getPaymentById = catchAsync(async (req, res) => {
  const result = await paymentService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment details retrieved successfully",
    data: result,
  });
});

// total sales
const totalSales = catchAsync(async (req, res) => {
  const result = await paymentService.totalSalesIntoDb({
    year: (req.query.year as string) || "",
    plan: (req.query.plan as string) || "",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Total Sales retrieved successfully",
    data: result,
  });
});

const updatePayment = catchAsync(async (req, res) => {
  const result = await paymentService.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment updated successfully",
    data: result,
  });
});

const deletePayment = catchAsync(async (req, res) => {
  const result = await paymentService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment deleted successfully",
    data: result,
  });
});

// create payment request
const createPaymentRequest = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await paymentService.createPaymentRequest(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment request created successfully",
    data: result,
  });
});

// payment confirm
const paymentConfirm = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await paymentService.paymentConfirmIntoDb(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment Confirm successfully",
    data: result,
  });
});

export const paymentController = {
  createPayment,
  getPaymentList,
  getPaymentById,
  updatePayment,
  deletePayment,
  createPaymentRequest,
  paymentConfirm,
  totalSales,
};
