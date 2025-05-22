import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import dynamicFieldService from "./dynamicField.service";
import { querySchema } from "./dynamicField.validation";

// create a dynamic field
const createDynamicField = catchAsync(async (req, res) => {
  const result = await dynamicFieldService.createDynamicField(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dynamic field created successfully",
    data: result,
  });
});

// get all dynamic fields
const getAllDynamicFields = catchAsync(async (req, res) => {
  const fields = await dynamicFieldService.getAllDynamicFields();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dynamic fields retrieved successfully",
    data: fields,
  });
});

// get a dynamic field by ID
const getDynamicFieldById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await dynamicFieldService.getDynamicFieldById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dynamic field retrieved successfully",
    data: result,
  });
});

// update a dynamic field
const updateDynamicField = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await dynamicFieldService.updateDynamicField(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dynamic field updated successfully",
    data: result,
  });
});

// delete a dynamic field
const deleteDynamicField = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await dynamicFieldService.deleteDynamicField(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dynamic field deleted successfully",
    data: result,
  });
});

const dynamicFieldController = {
  createDynamicField,
  getAllDynamicFields,
  getDynamicFieldById,
  updateDynamicField,
  deleteDynamicField,
};

export default dynamicFieldController;
