import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import ApiError from "../../../errors/ApiErrors";
import { fileUploader } from "../../../helpars/fileUploader";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";

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

    // check if a userId exists in the payload
    const findUser = await prisma.user.findUnique({
      where: {
        userId: bodyData.deceasedProfileId,
      },
    });
    if (!findUser) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "User not found for the provided deceasedProfileId"
      );
    }

    const image = await fileUploader.uploadToDigitalOcean(file);
    const imageUrl = image?.Location;

    const userData = {
      ...bodyData,
      deathCertificate: imageUrl,
    };

    req.body = userData;

    next();
  }
);
