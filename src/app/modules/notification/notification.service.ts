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

  const notification = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }
  if (findUser.role === "ADMIN" || findUser.role === "SUPER_ADMIN") {
    if (notification.type === "DEATH_VERIFICATION") {
      const deathVerification = await prisma.deathVerification.findUnique({
        where: {
          id: notification.dataId as string,
        },
        select: {
          id: true,
          status: true,
          deceasedProfileId: true,
        },
      });
      const user = await prisma.user.findUnique({
        where: {
          userId: deathVerification?.deceasedProfileId as string,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          userImage: true,
        },
      });

      if (user) {
        // (notification as any).label = "Death Verification";
        (notification as any).user = user;
        // (notification as any).status = deathVerification.status;
      }
    } else if (notification.type === "PARTNER_REQUEST") {
      const user = await prisma.user.findUnique({
        where: {
          id: notification.senderId as string,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          partnerImage: true,
        },
      });
      if (user) {
        (notification as any).user = user;
      }
    } else if (notification.type === "MEMORY_CLAIM_REQUEST") {
      const claimMemories = await prisma.memoryClaimRequest.findUnique({
        where: {
          id: notification.dataId as string,
        },
        select: {
          id: true,
          status: true,
          claimantName: true,
          deceasedProfileId: true,
        },
      });
      if (claimMemories) {
        const user = await prisma.user.findUnique({
          where: {
            userId: claimMemories.deceasedProfileId as string,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            userImage: true,
          },
        });
        if (user) {
          (notification as any).user = user;
        }
      }
    } else if (notification.type === "PAYMENT_SUBSCRIPTION") {
      const payment = await prisma.payment.findUnique({
        where: {
          id: notification.dataId as string,
        },
        select: {
          id: true,
          status: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              userImage: true,
            },
          },
        },
      });
      if (payment) {
        (notification as any).user = payment.user;
      }
    }
  }

  return notification;
};

export const notificationService = {
  getListFromDb,
  getMyNotificationFromDb,
  getByIdFromDb,
};
