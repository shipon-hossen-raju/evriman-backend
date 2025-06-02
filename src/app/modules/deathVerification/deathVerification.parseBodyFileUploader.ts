import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { fileUploader, upload } from "../../../helpars/fileUploader";
import catchAsync from "../../../shared/catchAsync";
import prisma from "../../../shared/prisma";

export const parseBodyFileUploader = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) {
      throw new ApiError(400, "Please provide data in the body under data key");
    }

    const bodyData = JSON.parse(req.body.data);

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (
      !files ||
      (!files.requesterImage?.length && !files.deathCertificate?.length)
    ) {
      throw new ApiError(
        400,
        "Both requesterImage and deathCertificate are required"
      );
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

    const images = {
      requesterImage: "",
      deathCertificate: "",
    };

    if (files.requesterImage?.length) {
      const uploaded = await fileUploader.uploadToDigitalOcean(
        files.requesterImage[0]
      );
      images.requesterImage = uploaded?.Location;
    }

    if (files.deathCertificate?.length) {
      const uploaded = await fileUploader.uploadToDigitalOcean(
        files.deathCertificate[0]
      );
      images.deathCertificate = uploaded?.Location;
    }

    // You can now attach the processed data to req.body for next middleware
    req.body = {
      ...bodyData,
      ...images,
    };

    next();
  }
);


export const updateProfile = upload.fields([
  { name: "requesterImage", maxCount: 1 },
  { name: "deathCertificate", maxCount: 1 },
]);
