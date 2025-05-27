import httpStatus from 'http-status';
import { memoryClaimRequestService } from './memoryClaimRequest.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const createMemoryClaimRequest = catchAsync(async (req, res) => {
  const result = await memoryClaimRequestService.createIntoDb(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Memory Claim Request created successfully',
    data: result,
  });
});

const getMemoryClaimRequestList = catchAsync(async (req, res) => {
  const result = await memoryClaimRequestService.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Memory Claim Request list retrieved successfully',
    data: result,
  });
});

const getMemoryClaimRequestById = catchAsync(async (req, res) => {
  const result = await memoryClaimRequestService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Memory Claim Request details retrieved successfully',
    data: result,
  });
});

const updateMemoryClaimRequest = catchAsync(async (req, res) => {
  const result = await memoryClaimRequestService.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Memory Claim Request updated successfully',
    data: result,
  });
});

const deleteMemoryClaimRequest = catchAsync(async (req, res) => {
  const result = await memoryClaimRequestService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Memory Claim Request deleted successfully',
    data: result,
  });
});

export const memoryClaimRequestController = {
  createMemoryClaimRequest,
  getMemoryClaimRequestList,
  getMemoryClaimRequestById,
  updateMemoryClaimRequest,
  deleteMemoryClaimRequest,
};