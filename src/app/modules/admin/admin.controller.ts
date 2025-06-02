import httpStatus from 'http-status';
import { adminService } from './admin.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

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
    message: 'Admin list retrieved successfully',
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
  // getAdminById,
  // updateAdmin,
  // deleteAdmin,
};