import { Request } from "express";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const getListFromDb = async () => {
  const result = await prisma.notification.findMany();
  return result;
};

// get my notification
const getMyNotificationFromDb = async (req: Request) => {
  const { id } = req.user;
  const { page: pageNumber, limit: limitNumber } = req.query;
  const page = Number(pageNumber) || 1;
  const limit = Number(limitNumber) || 10;
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  
  let where: any = {};

  const [result, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

// get notification by id
const getByIdFromDb = async (id: string, userId: string) => {
  const findUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
    },
  });
  if (!findUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }

  return result;
};

export const notificationService = {
  getListFromDb,
  getMyNotificationFromDb,
  getByIdFromDb,
};
