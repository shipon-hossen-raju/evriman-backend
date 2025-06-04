import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { adminService } from "./admin.service";

// const createAdmin = catchAsync(async (req, res) => {
//   const result = await adminService.createIntoDb(req.body);
//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Admin created successfully',
//     data: result,
//   });
// });

const getAdminList = catchAsync(async (req, res) => {
  const result = await adminService.getAdminHome();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin list retrieved successfully",
    data: result,
  });
});

// total sales
const totalSales = catchAsync(async (req, res) => {
  const result = await adminService.totalSalesIntoDb({
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

// Partner manage
const partnerManage = catchAsync(async (req, res) => {
  const topSales = req?.query?.topSales as string;
  const limit = (req?.query?.limit as string) || 10;
  
  const result = await adminService.partnerManageIntoDb(
    topSales,
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Total Sales retrieved successfully",
    data: result,
  });
});

// Partner manage
const adminNotification = catchAsync(async (req, res) => {
  
  const result = await adminService.getAdminNotification(
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin Notification retrieved successfully",
    data: result,
  });
});

const partnerSingleProfile = catchAsync(async (req, res) => {
  const result = await adminService.partnerSingleProfileIntoDb({
    profileId: req.params.profileId,
  });
  // const result = await adminService.totalSalesIntoDb({
  //   year: (req.query.year as string) || "",
  //   plan: (req.query.plan as string) || "",
  // });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Total Sales retrieved successfully",
    data: result,
  });
});

// const getAdminById = catchAsync(async (req, res) => {
//   const result = await adminService.getByIdFromDb(req.params.id);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Admin details retrieved successfully',
//     data: result,
//   });
// });

// const updateAdmin = catchAsync(async (req, res) => {
//   const result = await adminService.updateIntoDb(req.params.id, req.body);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Admin updated successfully',
//     data: result,
//   });
// });

// const deleteAdmin = catchAsync(async (req, res) => {
//   const result = await adminService.deleteItemFromDb(req.params.id);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Admin deleted successfully',
//     data: result,
//   });
// });

export const adminController = {
  // createAdmin,
  getAdminList,
  totalSales,
  partnerManage,
  partnerSingleProfile,
  adminNotification,
  // getAdminById,
  // updateAdmin,
  // deleteAdmin,
};
