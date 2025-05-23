import { NextFunction, Request, Response } from "express";
import ApiError from "../../../errors/ApiErrors";
import { fileUploader } from "../../../helpars/fileUploader";
import catchAsync from "../../../shared/catchAsync";

export const parseBodyFileUploader = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) {
      throw new ApiError(400, "Please provide data in the body under data key");
    }

    const bodyData = JSON.parse(req.body.data);

    const file = req.file;
    if (!file) {
      throw new ApiError(400, "File is required");
    }

    const image = await fileUploader.uploadToDigitalOcean(file);
    const photoUrl = image?.Location;

    const userData = {
      ...bodyData,
      photoUrl,
    };

    console.log("userData ", userData);

    req.body = userData;

    console.log("req.body ", req.body);

    next();
  }
);
