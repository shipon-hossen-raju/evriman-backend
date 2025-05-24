import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { fileUploader } from "../../../helpars/fileUploader";
import catchAsync from "../../../shared/catchAsync";
import prisma from "../../../shared/prisma";

export const parseBodyFileUploader = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    if (!req.body.data) {
      throw new ApiError(400, "Please provide data in the body under data key");
    }

    const userId = req.user?.id;

    const bodyData = JSON.parse(req.body.data);

    // find user
    const findUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!findUser) {
      throw new ApiError(404, "User not found!");
    }

    console.log("findUser ", findUser);

    const files = req.files;
    console.log("file ", files);
    if (!files) {
      throw new ApiError(400, "File is required");
    }

    // const image = await fileUploader.uploadToDigitalOcean(file);
    // const photoUrl = image?.Location;

    const userData = {
      ...bodyData,
      userId,
      // photoUrl,
    };

    req.body = userData;

    console.log("req.body ", req.body);

    // next();
  }
);
