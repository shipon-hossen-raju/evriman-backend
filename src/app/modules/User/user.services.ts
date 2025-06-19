import {
  DynamicFieldCategory,
  DynamicFieldStatus,
  DynamicFieldType,
  LoginType,
  Prisma,
  User,
  VerificationStatus,
} from "@prisma/client";
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
import { ApprovedMailTemp, OtpHtml, RejectedMailTemp } from "./user.mail";
import {
  generateReferralCode,
  generateUniquePartnerCode,
  generateUniqueUserId,
} from "./user.utils";

// Create a new user in the database.
const createUserIntoDb = async (payload: User & { isNewData?: boolean }) => {
  return await prisma.$transaction(async (tx) => {
    const justEmail = await tx.user.findFirst({
      where: {
        email: payload.email,
      },
    });

    // check referral
    if (payload.referralCodeUsed) {
      const checkReferral = await tx.user.findFirst({
        where: {
          referralCode: payload?.referralCodeUsed,
        },
      });

      if (!checkReferral) {
        throw new ApiError(httpStatus.NOT_FOUND, "Not Fount Referral Code!");
      }
    }

    // Check if the user already exists in the database
    const existingUser = await tx.user.findFirst({
      where: {
        email: payload.email,
        ...(payload.loginType === "PARTNER" && { isPartner: true }),
        ...(payload.loginType === "USER" && { isUser: true }),
      },
    });

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

    const env = config.env === "development" ? true : false;

    // update user data if user already exists
    let result;
    let defaultDataShow = {
      id: true,
      userId: true,
      referralCode: true,
      email: true,
      role: true,
      fullName: true,
      loginType: true,
      createdAt: true,
      updatedAt: true,
      otp: env,
      age: true,
      isCompleteProfile: true,
      isCompletePartnerProfile: true,
      isPaid: true,
    };
    if (justEmail?.id && justEmail?.email) {
      result = await tx.user.update({
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
        select: defaultDataShow,
      });
    } else {
      // create user id
      const userId = await generateUniqueUserId();
      const referralCode = await generateReferralCode();

      // increase referral
      if (payload.referralCodeUsed) {
        await prisma.user.update({
          where: {
            referralCode: payload.referralCodeUsed,
          },
          data: {
            userPoint: {
              increment: 1,
            },
          },
        });
      }

      result = await tx.user.create({
        data: {
          ...userData,
          userId: userId.toString(),
          referralCode,
          lastLogin: new Date(),
          referralCodeUsed: payload.referralCodeUsed,
        },
        select: defaultDataShow,
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

    // send email to user otp
    await emailSender(
      result.email,
      OtpHtml(otp),
      `Welcome to our service! Your OTP is: ${otp}`
    );

    return {
      result,
      token,
      otp,
      role: result?.role,
      loginType: result?.loginType,
      isCompleteProfile: result.isCompleteProfile,
      isCompletePartnerProfile: result.isCompletePartnerProfile,
      isPaid: result.isPaid,
    };
  });
};

// partner complete profile
const partnerCompleteProfileIntoDb = async (
  id: string,
  payload: Partial<User>
) => {
  const findUser = await prisma.user.findUnique({
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

  console.log("payload ", payload);

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
  const { searchTerm, contacts, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    // Only include string fields for 'contains' search
    const stringFields = [
      "email",
      "fullName",
      "address",
      "phoneNumber",
      "userId",
      "role",
      "status",
      "businessName",
    ]; // adjust as per your schema
    andConditions.push({
      OR: userSearchAbleFields
        .filter((field) => stringFields.includes(field))
        .map((field) => ({
          [field]: {
            contains: params.searchTerm,
            mode: "insensitive",
          },
        })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        let value = (filterData as any)[key];
        // Convert string "true"/"false" to boolean for boolean fields
        if (value === "true") value = true;
        if (value === "false") value = false;
        return {
          [key]: {
            equals: value,
          },
        };
      }),
    });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

  console.dir(andConditions, { depth: Infinity });

  let result;
  const defaultShowData = {
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
    isDeceased: true,
    userId: true,
    referralCode: true,

    isPaid: true,
    age: true,
  };
  // contact list count
  if (params.contacts) {
    const contactCount = Number(params.contacts);
    if (Array.isArray(params.contacts) && params.contacts.length > 0) {
      andConditions.push({
        OR: [
          {
            userId: {
              in: params.contacts,
            },
          },
        ],
      });
    }

    const usersWithDesiredContactCount = await prisma.user.findMany({
      where: whereConditions,
      include: {
        _count: {
          select: { ContactList: true },
        },
      },
    });
    const filteredUserIds = usersWithDesiredContactCount
      .filter((user) => user._count.ContactList === contactCount)
      .map((user) => user.id);

    // whereConditions.push
    const contactCondition = andConditions;
    contactCondition.push({
      id: {
        in: filteredUserIds,
      },
    });

    const whereConditionsContact: Prisma.UserWhereInput = {
      AND: contactCondition,
    };

    console.dir(whereConditionsContact, { depth: Infinity });

    result = await prisma.user.findMany({
      where: whereConditionsContact,
      select: {
        ...defaultShowData,
        userId: true,
        ContactList: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            relationship: true,
          },
        },
        _count: {
          select: {
            ContactList: true,
          },
        },
      },
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    result = await prisma.user.findMany({
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
        ...defaultShowData,
        // Count the number of ContactList entries for each user
        _count: {
          select: { ContactList: true },
        },
        // ContactList: true,
      },
    });
  }

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

// view profile
const viewProfile = async (profileId: string) => {

  const userProfile = await prisma.user.findUnique({
    where: {
      id: profileId,
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
          createdAt: "desc",
        },
        take: 1,
      },
      UserDynamicFieldValue: true,
      referredUsers: true,
    },
  });

  // find memories
  const memoriesData = await prisma.userMemory.findMany({
    where: {
      userId: profileId,
    },
  });

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
        type: DynamicFieldType;
        options: string[];
        status: DynamicFieldStatus;
        value: string;
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
        text: field.text,
        value: field.value ?? "",
        type: field.fieldType,
        options: [],
        status: DynamicFieldStatus.PUBLISHED || DynamicFieldStatus.DRAFT,
        category: field.category,
        createdAt: field.createdAt,
        updatedAt: field.updatedAt,
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
      partnerImage: true,
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
      partner: {
        select: {
          partnerCode: true
        }
      },
      _count: {
        select: { ContactList: true },
      },
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

// get partner
const getNotificationIntoDb = async (id: string) => {
  // find user
  const findUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, userId: true, isPaid: true },
  });

  // spacial offer You
  const spacialOfferCodeYou = await prisma.offerCode.findMany({
    where: {
      OR: [
        {
          targetUsers: {
            some: { userId: findUser?.id },
          },
        },
      ],
    },
  });

  // spacial offer
  const spacialOfferCode = await prisma.offerCode.findMany({
    where: {
      OR: [
        {
          targetUsers: {
            some: { userId: findUser?.id },
          },
        },
        {
          userType: "ALL",
        },
        {
          userType: findUser?.isPaid === true ? "PAID" : "ALL",
        },
      ],
    },
  });

  // find death verification
  const youAreDead = await prisma.deathVerification.findMany({
    where: {
      deceasedProfileId: findUser?.userId,
      OR: [
        {
          status: "CHECKING",
        },
      ],
    },
  });

  // other contact list find
  const othersContactList = await prisma.contactList.findMany({
    where: {
      email: findUser?.email,
    },
  });

  const contactVerification = await prisma.contactList.findMany({
    where: {
      email: findUser?.email,
      isDeathNotify: true,
    },
  });

  const contactListFind = await prisma.contactList.findMany({
    where: {
      OR: [
        {
          email: findUser?.email,
        },
        {
          guardianEmail: findUser?.email,
        },
      ],
    },
  });

  // Find memories where the user's id is included in the contactIds array
  const yourMemories = await prisma.userMemory.findMany({
    where: {
      OR: [
        {
          contacts: {
            some: {
              contactId: {
                in: contactListFind?.map((contact) => contact.id) || [],
              },
            },
          },
        },
      ],
    },
    include: {
      contacts: {
        include: {
          contact: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  userImage: true,
                  userId: true,
                  isDeceased: true
                }
              }
            }
          }
        }
      }
    }
  });

  return {
    yourMemories: yourMemories,
    spacialOfferCode,
    spacialOfferCodeYou,
    contactVerification,
    youAreDead,
    othersContactList,
  };
};

const notificationDeathStatusIntoDb = async (
  id: string,
  payload: { status: boolean }
) => {
  const findUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  const findContactVerification = await prisma.contactList.findFirst({
    where: {
      email: findUser?.email,
      isDeathNotify: true,
    },
  });

  if (!findContactVerification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Data Not Fount!");
  }

  const updateContact = await prisma.contactList.update({
    where: {
      id: findContactVerification.id,
    },
    data: {
      isDeath: payload.status === true ? true : false,
    },
  });

  return updateContact;
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
  // if (stringData) {
  //   parseData = JSON.parse(stringData);
  // }
  const result = await prisma.user.update({
    where: {
      id: existingUser.id, // Ensure `existingUser.id` is valid and exists
    },
    data: {
      // fullName: parseData.fullName || existingUser.fullName,
      // email: parseData.email || existingUser.email,
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

// update profile by user won profile using token or email and id
const profileImageUpload = async (req: Request) => {
  const file = req.file;

  let image;
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
  const result = await prisma.user.update({
    where: {
      id: existingUser.id,
    },

    data: {
      ...(existingUser.role === "USER" && {
        userImage: image || existingUser.userImage,
      }),
      ...(existingUser.isPartner === true && {
        partnerImage: image || existingUser.partnerImage,
      }),
      updatedAt: new Date(),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      ...(existingUser.role === "USER" && {
        userImage: true,
      }),
      ...(existingUser.role === "PARTNER" && {
        partnerImage: true,
      }),
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
  profileImageUpload,
  viewProfile,
  getNotificationIntoDb,
  notificationDeathStatusIntoDb,
};
