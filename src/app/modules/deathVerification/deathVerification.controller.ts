import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { deathVerificationService } from "./deathVerification.service";

// create death verification
const createDeathVerification = catchAsync(async (req, res) => {
  const result = await deathVerificationService.createIntoDb(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "DeathVerification created successfully",
    data: result,
  });
});

const getDeathVerificationList = catchAsync(async (req, res) => {
  const result = await deathVerificationService.getListFromDb();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "DeathVerification list retrieved successfully",
    data: result,
  });
});

const getDeathVerificationById = catchAsync(async (req, res) => {
  const result = await deathVerificationService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "DeathVerification details retrieved successfully",
    data: result,
  });
});

const updateDeathVerification = catchAsync(async (req, res) => {
  const result = await deathVerificationService.updateIntoDb(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "DeathVerification updated successfully",
    data: result,
  });
});

const statusUpdateDeathVerification = catchAsync(async (req, res) => {
  // Validate the status update request
  const result = await deathVerificationService.statusUpdateIntoDb(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "DeathVerification status updated successfully",
    data: result,
  });
});

const deleteDeathVerification = catchAsync(async (req, res) => {
  const result = await deathVerificationService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "DeathVerification deleted successfully",
    data: result,
  });
});

export const deathVerificationController = {
  createDeathVerification,
  getDeathVerificationList,
  getDeathVerificationById,
  updateDeathVerification,
  statusUpdateDeathVerification,
  deleteDeathVerification,
};
