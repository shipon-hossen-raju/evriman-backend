import { LoginType, Prisma, User, VerificationStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { differenceInYears } from "date-fns";
import { Request } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { fileUploader } from "../../../helpars/fileUploader";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import emailSender from "../../../shared/emailSender";
import prisma from "../../../shared/prisma";
import { generateOTP } from "../../../utils/GenerateOTP";
import { userSearchAbleFields } from "./user.costant";
import { IUserFilterRequest } from "./user.interface";
import { ApprovedMailTemp, RejectedMailTemp } from "./user.mail";
import { generateUniquePartnerCode, generateUniqueUserId } from "./user.utils";

// Create a new user in the database.
const createUserIntoDb = async (payload: User & { isNewData?: boolean }) => {
  const justEmail = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
  });

  console.log("justEmail ", justEmail);

  // Check if the user already exists in the database
  const existingUser = await prisma.user.findFirst({
    where: {
      email: payload.email,
      ...(payload.loginType === "PARTNER" && { isPartner: true }),
      ...(payload.loginType === "USER" && { isUser: true }),
    },
  });

  console.log("existingUser ", existingUser);

  if (existingUser) {
    if (existingUser.email === payload.email) {
      throw new ApiError(
        400,
        `User with this email ${payload.email} already exists`
      );
    }
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  // Generate a new OTP
  const { otp, otpExpires } = generateOTP();

  // create user id
  const userId = await generateUniqueUserId();

  // const {password, ...restPayload} = payload;

  // Ensure password is always a string
  let password: string;
  if (payload.isNewData === true) {
    password = hashedPassword;
  } else if (justEmail?.password) {
    password = justEmail.password;
  } else {
    throw new ApiError(400, "Password is required for user creation");
  }

  const { isNewData, ...restPayload } = payload;
  const {
    referralCodeUsed,
    partnerAgreement,
    updatedAt,
    partnerType,
    businessName,
    ...restPayloadFiltered
  } = restPayload;

  const userData = {
    ...restPayloadFiltered,
    userId: userId.toString(),
    password,
    otp,
    expirationOtp: otpExpires,
    loginType: payload.loginType as LoginType,
    phoneNumber: payload.phoneNumber,
    fullName: payload.fullName,
    role: payload.role,
    status: payload.status,
    address: payload.address,
    dob: payload.dob,
    age: payload.dob ? differenceInYears(new Date(), payload.dob) : 0,
    idDocument: payload.idDocument,
    referralCodeUsed: payload.referralCodeUsed,
    termsAccepted: payload.termsAccepted,
    privacyAccepted: payload.privacyAccepted,
    isVerified: payload.isVerified,
    isDeceased: payload.isDeceased,
    createdAt: new Date(),
    updatedAt: new Date(),

    // partner information
    partnerAgreement: payload?.partnerAgreement || null,
    partnerType: payload?.partnerType || null,
    businessName: payload?.businessName || null,

    ...(payload.loginType === "PARTNER" && { isPartner: true }),
    ...(payload.loginType === "USER" && { isUser: true }),
  };

  console.log("userData ", userData);

  const env = config.env === "development" ? true : false;

  // update user data if user already exists
  let result;
  if (justEmail?.id && justEmail?.email) {
    result = await prisma.user.update({
      where: {
        email: justEmail.email,
        id: justEmail.id,
      },
      data: {
        ...userData,
        otp,
        expirationOtp: otpExpires,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        email: true,
        role: true,
        fullName: true,
        loginType: true,
        createdAt: true,
        updatedAt: true,
        otp: env,
      },
    });
  } else {
    result = await prisma.user.create({
      data: { ...userData },
      select: {
        id: true,
        userId: true,
        email: true,
        role: true,
        loginType: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
        otp: env,
      },
    });
  }

  const token = jwtHelpers.generateToken(
    {
      id: result?.id,
      email: result?.email,
      role: result?.role,
      LoginType: result?.loginType,
      name: result?.fullName,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return { result, token, otp };
};

// partner complete profile
const partnerCompleteProfileIntoDb = async (
  id: string,
  payload: Partial<User>
) => {
  const findUser = await prisma.user.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  // check if user exists
  if (!findUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...payload,
      updatedAt: new Date(),
    },
  });

  return updatedUser;
};

// reterive all users from the database also searching anf filtering
const getUsersFromDb = async (
  params: IUserFilterRequest,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  console.log("params ", params);

  const andConditions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  console.log("searchTerm ", searchTerm);
  console.dir(andConditions, { depth: Infinity });

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

  console.log("params 246 ", params);

  const result = await prisma.user.findMany({
    where: {...params},
    skip,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      phoneNumber: true,
      dob: true,
      address: true,
      userImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const total = await prisma.user.count({
    where: whereConditions,
  });

  if (!result || result.length === 0) {
    throw new ApiError(404, "No active users found");
  }
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// reterive all partner from the database also searching anf filtering
const getAllPartnerFromDb = async (
  params: IUserFilterRequest,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.UserWhereInput = {
    AND: {
      ...andConditions,
      isPartner: true,
      role: "USER",
    },
  };

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isPartner: true,
      isUser: true,
      phoneNumber: true,
      dob: true,
      address: true,
      createdAt: true,
      updatedAt: true,
      accountHolderName: true,
      accountNumber: true,
      bankName: true,
      businessName: true,
      shortCode: true,
      partnerAgreement: true,
      partnerStatus: true,
    },
  });
  const total = await prisma.user.count({
    where: whereConditions,
  });

  if (!result || result.length === 0) {
    throw new ApiError(404, "No active users found");
  }
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// get partner
const getPartner = async (id: string) => {
  const result = await prisma.user.findFirst({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isPartner: true,
      isUser: true,
      phoneNumber: true,
      dob: true,
      address: true,
      createdAt: true,
      updatedAt: true,
      accountHolderName: true,
      accountNumber: true,
      bankName: true,
      businessName: true,
      shortCode: true,
      partnerAgreement: true,
      partnerStatus: true,
    },
  });

  return result;
};

// update partner status
const updatePartnerStatus = async (
  id: string,
  payload: { partnerStatus: VerificationStatus }
) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  let updatedUser;
  if (payload.partnerStatus === "APPROVED") {
    updatedUser = await prisma.user.update({
      where: { id },
      data: {
        partnerStatus: payload.partnerStatus,
        role: "PARTNER",
        updatedAt: new Date(),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        partnerStatus: true,
        updatedAt: true,
        businessName: true,
      },
    });

    // Generate a unique partner code using a random 6-digit number and user id
    const partnerCode = await generateUniquePartnerCode();

    // check again
    const findPartner = await prisma.partnerCode.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        partnerCode: true,
        id: true,
      },
    });

    console.log("findPartner ", findPartner);

    if (!findPartner) {
      await prisma.partnerCode.create({
        data: {
          partnerCode: partnerCode,
          userId: updatedUser.id,
        },
      });
    }

    // send email to user
    const email = await emailSender(
      updatedUser.email,
      ApprovedMailTemp({
        name: updatedUser.fullName,
        status: updatedUser.partnerStatus ?? "APPROVED",
        partnerCode: findPartner ? findPartner.partnerCode : partnerCode,
      }),
      `Partner Status Notification from ${config.site_name}`
    );
  } else if (payload.partnerStatus === "REJECTED") {
    updatedUser = await prisma.user.update({
      where: { id },
      data: {
        partnerStatus: payload.partnerStatus,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        partnerStatus: true,
        updatedAt: true,
        businessName: true,
      },
    });

    // send email to user
    const email = await emailSender(
      updatedUser.email,
      RejectedMailTemp({
        name: updatedUser.fullName,
        status: updatedUser.partnerStatus ?? "REJECTED",
      }),
      `Partner Status Notification from ${config.site_name}`
    );
  }

  return updatedUser;
};

// update profile by user won profile uisng token or email and id
const updateProfile = async (req: Request) => {
  const file = req.file;
  const stringData = req.body.data;
  let image;
  let parseData;
  const existingUser = await prisma.user.findFirst({
    where: {
      id: req.user.id,
    },
  });
  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }
  if (file) {
    image = (await fileUploader.uploadToDigitalOcean(file)).Location;
  }
  if (stringData) {
    parseData = JSON.parse(stringData);
  }
  const result = await prisma.user.update({
    where: {
      id: existingUser.id, // Ensure `existingUser.id` is valid and exists
    },
    data: {
      fullName: parseData.fullName || existingUser.fullName,
      email: parseData.email || existingUser.email,
      // profileImage: image || existingUser.profileImage,
      updatedAt: new Date(), // Assuming your model has an `updatedAt` field
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      // profileImage: true,
    },
  });

  return result;
};

// update user data into database by id fir admin
const updateUserIntoDb = async (payload: User, id: string) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
    },
  });
  if (!userInfo)
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with id: " + id);

  const result = await prisma.user.update({
    where: {
      id: userInfo.id,
    },
    data: payload,
    select: {
      id: true,
      fullName: true,
      email: true,
      // profileImage: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!result)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update user profile"
    );

  return result;
};

export const userService = {
  createUserIntoDb,
  partnerCompleteProfileIntoDb,
  getAllPartnerFromDb,
  getUsersFromDb,
  updateProfile,
  updateUserIntoDb,
  getPartner,
  updatePartnerStatus,
};
