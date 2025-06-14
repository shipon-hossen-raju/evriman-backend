import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import userMemoryService from "./userMemory.service";

// create User Memory data
const createUserMemoryData = catchAsync(async (req, res) => {
  const newUserMemoryData = await userMemoryService.createUserMemory(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Memory Data created successfully",
    data: newUserMemoryData,
  });
});

// update User Memory data
const updateUserMemory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedUserMemory = await userMemoryService.updateUserMemory(
    id,
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Memory Data updated successfully",
    data: updatedUserMemory,
  });
});

// get all User Memory data find & search query
const getUserMemoriesAll = catchAsync(async (req, res) => {
  const filters = req.query;
  const userId = req.user.id;

  const userMemoryData = await userMemoryService.getUserMemoriesAll(
    userId,
    filters
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Memory Data retrieved successfully",
    data: userMemoryData,
  });
});

// get all User Memory data find & search query
const getAllUserMemoryData = catchAsync(async (req, res) => {
  const filters = req.query;
  const userId = req.user.id;
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const userMemoryData = await userMemoryService.getAllUserMemories(
    userId,
    filters,
    options
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Memory Data retrieved successfully",
    data: userMemoryData,
  });
});

// get User Memory data by userId
const getUserMemoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userMemoryData = await userMemoryService.getUserMemoryById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Memory Data retrieved successfully",
    data: userMemoryData,
  });
});

// get User Memory data by id
const deleteUserMemory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedUserMemory = await userMemoryService.deleteUserMemory(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Memory Data deleted successfully",
    data: deletedUserMemory,
  });
});

const userMemoryController = {
  createUserMemoryData,
  updateUserMemory,
  getAllUserMemoryData,
  getUserMemoriesAll,
  getUserMemoryById,
  deleteUserMemory,
};

export default userMemoryController;
