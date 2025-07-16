import { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import catchAsync from "../../../shared/catchAsync";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

export const parseBodyFileUploader = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let fileUrl;
    let userData;

    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }
    
    const file = req.file;

    let bodyData = JSON.parse(req.body.data);
    if (file && bodyData.fieldType === "FILE") {
      const uploadedFile = await fileUploader.uploadToDigitalOcean(file);
      fileUrl = uploadedFile?.Location;

      userData = {
        ...bodyData,
        value: bodyData.fieldType === "FILE" ? fileUrl : bodyData.value,
      };
    } else {
      // const bodyData = JSON.parse(req.body.data);

      userData = {
        ...bodyData,
      };
    }

    req.body = {
      ...userData,
      userId: req.user?.id,
    };

    next();
  }
);
