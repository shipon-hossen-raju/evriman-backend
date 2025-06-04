import {
  DynamicFieldCategory,
  DynamicFieldStatus,
  DynamicFieldType,
  LoginType,
  UserStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import emailSender from "../../../shared/emailSender";
import prisma from "../../../shared/prisma";
import { generateOTP } from "../../../utils/GenerateOTP";

// user login
const loginUser = async (payload: {
  email: string;
  password: string;
  loginType: LoginType;
}) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
      ...(payload.loginType === "PARTNER" && {
        partnerStatus: "APPROVED",
        isPartner: true,
        role: "PARTNER",
      }),
      ...(payload.loginType === "USER" && { isUser: true }),
    },
  });

  if (!userData?.email) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `${payload.loginType} not found! with this email ${payload.email}`
    );
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect!");
  }

  // Update lastLogin field
  await prisma.user.update({
    where: { id: userData.id },
    data: { lastLogin: new Date(), loginType: payload.loginType },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData?.id,
      email: userData?.email,
      role: userData?.role,
      LoginType: payload.loginType,
      name: userData?.fullName,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    token: accessToken,
    role: userData?.role,
    LoginType: payload.loginType,
    isCompleteProfile: userData.isCompleteProfile,
    isCompletePartnerProfile: userData.isCompletePartnerProfile,
    lastLogin: new Date(),
  };
};

// get user profile
const getMyProfile = async (id: string) => {
  const userProfile = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      ContactList: true,
      memories: true,
      deathVerification: true,
      memoryClaimRequests: true,
      offerCodes: true,
      payments: {
        select: {
          amountPay: true,
          offerCodeId: true,
          subscriptionPlan: true,
          id: true, 
          endDate: true,
          startDate: true,
          amountOfferCode: true,
          amountPricing: true,
          amountUserPoint: true, 
          commissionAmount: true,
          commissionReceiverId: true,
          commissionType: true,
          contactLimit: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1, 
      },
      UserDynamicFieldValue: {
        select: {
          id: true,
          category: true,
          value: true,
          fieldName: true,
          fieldType: true,
          text: true,
          createdAt: true
        }
      },
      referredUsers: true
    },
  });

  // find memories
  const memoriesData = await prisma.userMemory.findMany({
    where: {
      userId: id
    }
  })

  // Get referredUsers count and data
  let referredUsersCount = 0;
  let referredUsersData: any[] = [];
  if (userProfile && userProfile.referredUsers) {
    referredUsersCount = userProfile.referredUsers.length;
    referredUsersData = userProfile.referredUsers;
  }

  // find partner code
  const partnerCode = await prisma.partnerCode.findUnique({
    where: {
      userId: userProfile?.id,
    },
  });

  // group by Category for UserDynamicFieldValue
  const groupedByCategory = Object.values(DynamicFieldCategory).reduce<
    Record<
      string,
      {
        id: string;
        label: string;
        fieldName: string;
        text: string;
        value: string;
        type: DynamicFieldType;
        options: string[];
        status: DynamicFieldStatus;
        category: DynamicFieldCategory;
        createdAt: Date;
        updatedAt: Date;
      }[]
    >
  >((acc, category) => {
    const fields = (userProfile?.UserDynamicFieldValue ?? [])
      .filter((field) => field.category === category)
      .map((field) => ({
        id: field.id,
        label: field.fieldName,
        fieldName: field.fieldName,
        text: field.text ?? "",
        value: field.value ?? "",
        type: field.fieldType,
        options: [] as string[],
        status: DynamicFieldStatus.PUBLISHED,
        category: field.category,
        createdAt: field.createdAt,
        updatedAt: field.createdAt,
      }));

    acc[category] = fields;
    return acc;
  }, {});

  if (userProfile) {
    const {
      password,
      UserDynamicFieldValue,
      referredUsers,
      ...profileWithoutPassword
    } = userProfile as any;

    const userData = {
      ...profileWithoutPassword,
      referredUsersCount,
      referredUsersData,
      partnerCode,
    };

    return { userData, memoriesData, groupedByCategory };
  }

  return { userProfile, memoriesData, groupedByCategory };
};

// change password
const changePassword = async (
  userToken: string,
  newPassword: string,
  oldPassword: string
) => {
  const decodedToken = jwtHelpers.verifyToken(
    userToken,
    config.jwt.jwt_secret!
  );

  const user = await prisma.user.findUnique({
    where: { id: decodedToken?.id },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new ApiError(403, "Your account is blocked");
  }
  const isPasswordValid = await bcrypt.compare(oldPassword, user?.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect old password");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const result = await prisma.user.update({
    where: {
      id: decodedToken.id,
    },
    data: {
      password: hashedPassword,
    },
  });
  return { message: "Password changed successfully" };
};

// forgot password
const forgotPassword = async (payload: { email: string }) => {
  // Fetch user data or throw if not found
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email: payload.email,
    },
  });

  // Generate a new OTP
  const { otp, otpExpires } = generateOTP();

  // Create the email content
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #6c63ff, #3f51b5); border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
            <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
                <span style="color: #ffeb3b;">Forgot Password OTP</span>
            </h2>
            <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                Your forgot password OTP code is below.
            </p>
            <p style="font-size: 32px; font-weight: bold; color: #ff4081; text-align: center; margin: 20px 0;">
                ${otp}
            </p>
            <div style="text-align: center; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    This OTP will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.
                </p>
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    If you need assistance, feel free to contact us.
                </p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Best Regards,<br/>
                    <span style="font-weight: bold; color: #3f51b5;">Nmbull Team</span><br/>
                    <a href="mailto:support@nmbull.com" style="color: #ffffff; text-decoration: none; font-weight: bold;">Contact Support</a>
                </p>
            </div>
        </div>
    </div> `;

  // Send the OTP email to the user
  await emailSender(userData.email, html, "Forgot Password OTP");

  // Update the user's OTP and expiration in the database
  await prisma.user.update({
    where: { id: userData.id },
    data: {
      otp: otp,
      expirationOtp: otpExpires,
    },
  });

  return { message: "Reset password OTP sent to your email successfully" };
};

const resendOtp = async (email: string) => {
  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // Generate a new OTP
  const { otp, otpExpires } = generateOTP();

  // Create email content
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #6c63ff, #3f51b5); border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
            <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
                <span style="color: #ffeb3b;">Resend OTP</span>
            </h2>
            <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                Here is your new OTP code to complete the process.
            </p>
            <p style="font-size: 32px; font-weight: bold; color: #ff4081; text-align: center; margin: 20px 0;">
                ${otp}
            </p>
            <div style="text-align: center; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    This OTP will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.
                </p>
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    If you need further assistance, feel free to contact us.
                </p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Best Regards,<br/>
                    <span style="font-weight: bold; color: #3f51b5;">levimusuc@team.com</span><br/>
                    <a href="mailto:support@booksy.buzz.com" style="color: #ffffff; text-decoration: none; font-weight: bold;">Contact Support</a>
                </p>
            </div>
        </div>
    </div>
  `;

  // Send the OTP to user's email
  await emailSender(user.email, html, "Resend OTP");

  // Update the user's profile with the new OTP and expiration
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      otp: otp,
      expirationOtp: otpExpires,
    },
  });

  return { message: "OTP resent successfully" };
};

const verifyForgotPasswordOtp = async (payload: {
  email: string;
  otp: number;
}) => {
  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // Check if the OTP is valid and not expired
  if (
    user.otp !== payload.otp ||
    !user.expirationOtp ||
    user.expirationOtp < new Date()
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  // Update the user's OTP, OTP expiration, and verification status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp: null,
      expirationOtp: null,
    },
  });

  return { message: "OTP verification successful" };
};

// reset password
const resetPassword = async (payload: { password: string; email: string }) => {
  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  // Update the user's password in the database
  await prisma.user.update({
    where: { email: payload.email },
    data: {
      password: hashedPassword,
      otp: null,
      expirationOtp: null,
    },
  });

  return { message: "Password reset successfully" };
};

// verify email
const verifyEmail = async (email: string, verificationCode: number) => {
  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // Check if the verification code is valid
  if (user.otp !== verificationCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid verification code");
  }

  // Update the user's status to verified
  await prisma.user.update({
    where: { email: email },
    data: { isVerified: true },
  });
  return { message: "Email verified successfully" };
};

export const authServices = {
  loginUser,
  getMyProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  resendOtp,
  verifyForgotPasswordOtp,
  verifyEmail,
};
