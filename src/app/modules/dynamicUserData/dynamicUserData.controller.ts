import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import dynamicUserDataService from "./dynamicUserData.service";

// create dynamic user data
const createDynamicUserData = catchAsync(async (req, res) => {
   
  const newDynamicUserData = await dynamicUserDataService.createDynamicUserData(
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Dynamic User Data created successfully",
    data: newDynamicUserData,
  });
});

// update dynamic user data
const updateDynamicUserData = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedDynamicUserData = await dynamicUserDataService.updateDynamicUserData(req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dynamic User Data updated successfully",
    data: updatedDynamicUserData,
  });
});

// get all dynamic user data
const getAllDynamicUserData = catchAsync(async (req, res) => {
  const allDynamicUserData = await dynamicUserDataService.getAllDynamicUserData();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All Dynamic User Data retrieved successfully",
    data: allDynamicUserData,
  });
});

// get dynamic user data by userId
const getDynamicUserDataByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const dynamicUserData = await dynamicUserDataService.getDynamicUserDataByUserId(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dynamic User Data retrieved successfully",
    data: dynamicUserData,
  });
});

// get dynamic user data by id
const getDynamicUserDataById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const dynamicUserData = await dynamicUserDataService.getDynamicUserDataById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dynamic User Data retrieved successfully",
    data: dynamicUserData,
  });
});

// delete dynamic user data
const deleteDynamicUserData = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedDynamicUserData = await dynamicUserDataService.deleteDynamicUserData(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dynamic User Data deleted successfully",
    data: deletedDynamicUserData,
  });
});

const dynamicUserDataController = {
  createDynamicUserData,
  updateDynamicUserData,
  getAllDynamicUserData,
  getDynamicUserDataByUserId,
  deleteDynamicUserData,
  getDynamicUserDataById,
};

export default dynamicUserDataController;