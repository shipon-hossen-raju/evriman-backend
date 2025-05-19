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
