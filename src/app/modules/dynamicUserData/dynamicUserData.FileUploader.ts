import { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import catchAsync from "../../../shared/catchAsync";

export const parseBodyFileUploader = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let fileUrl;
    let userData;

    const file = req.file;

    if (file) {
      const bodyData = JSON.parse(req.body.data);

      const uploadedFile = await fileUploader.uploadToDigitalOcean(file);
      fileUrl = uploadedFile?.Location;

      userData = {
        ...bodyData,
        value: bodyData.fieldType === "FILE" ? fileUrl : bodyData.value,
      };
    } else {
      // const bodyData = JSON.parse(req.body.data);

      userData = {
        ...req.body,
      };
    }

    req.body = userData;

    next();
  }
);
