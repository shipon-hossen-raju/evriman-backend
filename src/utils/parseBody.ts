// import { StatusCodes } from "http-status-codes";
// import AppError from "../errors/appError";
// import catchAsync from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../shared/catchAsync";
import ApiError from "../errors/ApiErrors";

export const parseBody = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) {
      throw new ApiError(
        400,
        "Please provide data in the body under data key"
      );
    }
    req.body = JSON.parse(req.body.data);
    req.body.file = req.file;
    // console.log("req.body.file ", req.body.file);

    next();
  }
);

// import { Request, Response } from "express";
// import ApiError from "../errors/ApiErrors";
// import { fileUploader } from "../helpars/fileUploader";
// import catchAsync from "../shared/catchAsync";

// export const fromDataFileUpload = catchAsync(
//   async (req: Request, res: Response) => {
//     // Process the uploaded file
//     const file = req.file;
//     if (!file) {
//       throw new ApiError(400, "File is required");
//     }

//     const image = await fileUploader.uploadToDigitalOcean(file);
//     const imageUrl = image?.Location;

//     console.log("imageUrl ", imageUrl);

//     console.log("req.body ", req.body);
//     console.log("req.body.data ", req.body.data);
//       const stringData = req.body.data;
//       let parseData;
//       if (stringData) {
//         parseData = JSON.parse(stringData);
//       }
//       console.log("parseData ", parseData);

//     console.log("19 image ", image);
//   }
// );
