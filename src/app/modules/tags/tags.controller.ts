import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import tagsService from "./tags.service";

// create a tags
const createTags = catchAsync(async (req, res) => {
  const result = await tagsService.createTags(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Tags created successfully",
    data: result,
  });
});

// get all tags
const getAllTags = catchAsync(async (req, res) => {
  const result = await tagsService.getAllTags();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tags retrieved successfully",
    data: result,
  });
});

// get a tag by ID
const getTagById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await tagsService.getTagsById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tags retrieved successfully",
    data: result,
  });
});

// update a dynamic field
const updateTag = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await tagsService.updateTag(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "tag updated successfully",
    data: result,
  });
});

// delete a dynamic field
const deleteTag = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await tagsService.deleteTags(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tag deleted successfully",
    data: result,
  });
});

const tagsController = {
  createTags,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
};

export default tagsController;
