import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import { levelService } from './Level.service';
import sendResponse from '../../../shared/sendResponse';

const createLevel = catchAsync(async (req, res) => {
  const result = await levelService.createIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Level created successfully',
    data: result,
  });
});

const getLevelList = catchAsync(async (req, res) => {
  const result = await levelService.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Level list retrieved successfully',
    data: result,
  });
});

const getLevelById = catchAsync(async (req, res) => {
  const result = await levelService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Level details retrieved successfully',
    data: result,
  });
});

const updateLevel = catchAsync(async (req, res) => {
  const result = await levelService.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Level updated successfully',
    data: result,
  });
});

const deleteLevel = catchAsync(async (req, res) => {
  const result = await levelService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Level deleted successfully',
    data: result,
  });
});

export const LevelController = {
  createLevel,
  getLevelList,
  getLevelById,
  updateLevel,
  deleteLevel,
};