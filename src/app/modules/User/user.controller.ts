import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { userFilterableFields } from "./user.costant";
import { userService } from "./user.services";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUserIntoDb(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Registered successfully!",

    data: {
      result: result.result,
      token: result.token,
    },
  });
});

// partner complete profile
const partnerCompleteProfile = catchAsync(async (req, res) => {
  const result = await userService.partnerCompleteProfileIntoDb(
    req.user?.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner profile completed successfully!",
    data: result,
  });
});

// partner get all users
const getAllPartner = catchAsync(async (req, res) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await userService.getAllPartnerFromDb(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieve successfully!",
    data: result,
  });
});

// partner get all users
const getPartner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await userService.getPartner(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieve successfully!",
    data: result,
  });
});

// get all user form db
const getNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getNotificationIntoDb(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieve successfully!",
    data: result,
  });
});

// get all user form db
const notificationDeathStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await userService.notificationDeathStatusIntoDb(
      req.user.id,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users retrieve successfully!",
      data: result,
    });
  }
);

// get all user form db
const getUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await userService.getUsersFromDb(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieve successfully!",
    data: result,
  });
});

// view profile
const viewProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.viewProfile(req.params.profileId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieve successfully!",
    data: result,
  });
});

// get all user form db
const updateProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req?.user;

    const result = await userService.updateProfile(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  }
);

// get partner status form db
const updatePartnerStatus = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await userService.updatePartnerStatus(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  }
);

const profileImageUpload = catchAsync(async (req, res) => {
  const result = await userService.profileImageUpload(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile image updated successfully!",
    data: result,
  });
});

// *! update user role and account status
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await userService.updateUserIntoDb(req.body, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

export const userController = {
  createUser,
  getUsers,
  updateProfile,
  updateUser,
  partnerCompleteProfile,
  getAllPartner,
  getPartner,
  updatePartnerStatus,
  profileImageUpload,
  viewProfile,
  getNotification,
  notificationDeathStatus,
};
