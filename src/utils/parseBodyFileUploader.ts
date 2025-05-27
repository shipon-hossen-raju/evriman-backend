import { NextFunction, Request, Response } from "express";
import ApiError from "../errors/ApiErrors";
import { fileUploader } from "../helpars/fileUploader";
import catchAsync from "../shared/catchAsync";

export const parseBodyFileUploader = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) {
      throw new ApiError(400, "Please provide data in the body under data key");
    }

    const bodyData = JSON.parse(req.body.data);

    console.log("bodyData ", bodyData);

    const file = req.file;
    let imageUrl: string = "";
    if (!file && bodyData.loginType === "User") {
      throw new ApiError(400, "File is required");
    } else if (file) {
      const image = await fileUploader.uploadToDigitalOcean(file);
      imageUrl = image?.Location || "";

      if (!imageUrl) {
        throw new ApiError(400, "Failed to upload file");
      }
    }

   

    const userData = {
      ...bodyData,
      idDocument: imageUrl,
    };

    req.body = userData;

    console.log("Parsed body data: ", req.body);

    next();
  }
);
