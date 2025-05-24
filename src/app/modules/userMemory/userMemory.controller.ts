import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import userMemoryService from "./userMemory.service";

// create User Memory data
const createUserMemoryData = catchAsync(async (req, res) => {
  const newUserMemoryData = await userMemoryService.createUserMemory(
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Memory Data created successfully",
    data: newUserMemoryData,
  });
});

// update User Memory data
// const updateDynamicUserData = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const updatedDynamicUserData =
//     await dynamicUserDataService.updateDynamicUserData(id, req.body);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "User Memory Data updated successfully",
//     data: updatedDynamicUserData,
//   });
// });

// // get all User Memory data
// const getAllDynamicUserData = catchAsync(async (req, res) => {
//   const allDynamicUserData =
//     await dynamicUserDataService.getAllDynamicUserData();
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "All User Memory Data retrieved successfully",
//     data: allDynamicUserData,
//   });
// });

// // get User Memory data by userId
// const getDynamicUserDataByUserId = catchAsync(async (req, res) => {
//   const { userId } = req.params;

//   const dynamicUserData =
//     await dynamicUserDataService.getDynamicUserDataByUserId(userId);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "User Memory Data retrieved successfully",
//     data: dynamicUserData,
//   });
// });

// // get User Memory data by id
// const getDynamicUserDataById = catchAsync(async (req, res) => {
//   const { id } = req.params;

//   const dynamicUserData = await dynamicUserDataService.getDynamicUserDataById(
//     id
//   );

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "User Memory Data retrieved successfully",
//     data: dynamicUserData,
//   });
// });

// // delete User Memory data
// const deleteDynamicUserData = catchAsync(async (req, res) => {
//   const { id } = req.params;

//   const deletedDynamicUserData =
//     await dynamicUserDataService.deleteDynamicUserData(id);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "User Memory Data deleted successfully",
//     data: deletedDynamicUserData,
//   });
// });

const userMemoryController = {
  createUserMemoryData,

};

export default userMemoryController;
