
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { notificationService } from './notification.service';


const getNotificationList = catchAsync(async (req, res) => {
  const result = await notificationService.getMyNotificationFromDb(req);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification list retrieved successfully',
    data: result,
  });
});

// view notification by id
const getNotificationById = catchAsync(async (req, res) => {
  const result = await notificationService.getByIdFromDb(req.params.id, req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification details retrieved successfully',
    data: result,
  }); 
})


export const notificationController = {
  // createNotification,
  getNotificationList,
  getNotificationById,
};