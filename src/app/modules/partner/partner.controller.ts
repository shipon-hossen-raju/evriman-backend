import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { partnerService } from "./partner.service";

const createPartner = catchAsync(async (req, res) => {
  const result = await partnerService.createIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Partner created successfully",
    data: result,
  });
});

const getPartnerList = catchAsync(async (req, res) => {
  const result = await partnerService.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner list retrieved successfully",
    data: result,
  });
});

const getPartnerProfile = catchAsync(async (req, res) => {
  const result = await partnerService.getPartnerProfileIntoDb(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner profile retrieved successfully",
    data: result,
  });
});

const usersLinked = catchAsync(async (req, res) => {
  const result = await partnerService.usersLinkedIntoDb(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users Linked retrieved successfully",
    data: result,
  });
});

const viewProfile = catchAsync(async (req, res) => {
  const result = await partnerService.viewProfileIntoDb(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users Linked retrieved successfully",
    data: result,
  });
});

const getPartnerById = catchAsync(async (req, res) => {
  const result = await partnerService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner details retrieved successfully",
    data: result,
  });
});

const updatePartner = catchAsync(async (req, res) => {
  const result = await partnerService.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner updated successfully",
    data: result,
  });
});

const deletePartner = catchAsync(async (req, res) => {
  const result = await partnerService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner deleted successfully",
    data: result,
  });
});

export const partnerController = {
  createPartner,
  getPartnerList,
  getPartnerById,
  updatePartner,
  deletePartner,
  getPartnerProfile,
  usersLinked,
  viewProfile,
};
