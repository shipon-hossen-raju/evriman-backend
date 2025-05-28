import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import prisma from "../../../shared/prisma";
import { fileUploader } from "../../../helpars/fileUploader";

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
      include: {
        ContactList: {
          where: {
            email: bodyData.claimantEmail,
          },
          select: {
            id: true,
            email: true,
          },
        }
      },
    });
    if (!findUser) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "User not found for the provided deceasedProfileId or claimantEmail"
      );
    }

    if (findUser.ContactList.length === 0) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Contact not found for the provided claimantEmail"
      );
    }

    const image = await fileUploader.uploadToDigitalOcean(file);
    const imageUrl = image?.Location;

    const userData = {
      ...bodyData,
      deathCertificate: imageUrl,
      contactId: findUser.ContactList[0].id,
    };

    req.body = userData;

    next();
  }
);
