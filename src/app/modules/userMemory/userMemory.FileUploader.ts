import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { fileUploader } from "../../../helpars/fileUploader";
import catchAsync from "../../../shared/catchAsync";

export const parseBodyFileUploader = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    if (!req.body.data) {
      throw new ApiError(400, "Please provide data in the body under data key");
    }

    const userId = req?.user?.id;

    const bodyData = JSON.parse(req.body.data);

    let files: any[] = [];

    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === "object") {
      files = Object.values(req.files).flat();
    }

    // if (!files || files.length === 0) {
    //   throw new ApiError(400, "File is required");
    // }

    const fileUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploaded = await fileUploader.uploadToDigitalOcean(file);
        fileUrls.push(uploaded.Location);
      }
    }

    const userData = {
      ...bodyData,
      userId,
      files: fileUrls.length > 0 ? [...fileUrls] : [],
    };

    req.body = userData;

    next();
  }
);
