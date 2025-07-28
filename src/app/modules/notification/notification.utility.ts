import { NotificationType } from "@prisma/client";
import prisma from "../../../shared/prisma";
import admin from "./firebaseAdmin";

interface BulkNotificationInput {
  title: string;
  body: string;
  type: NotificationType;
  dataId?: string; // Optional, useful for linking to post
  senderId?: string; // Optional, useful for linking to post
  receiverIds?: string[]; // Optional, useful for linking to post
}

// Send notification to multiple users
export const sendBulkNotification = async ({
  title,
  body,
  type,
  dataId,
  senderId,
  receiverIds,
}: BulkNotificationInput): Promise<void> => {
  if (receiverIds && receiverIds.length === 0) return;

  if (receiverIds && receiverIds.length > 0) {
    await Promise.all(
      receiverIds.map((receiverId) => {
        return sendSingleNotification({
          dataId,
          receiverId,
          title,
          type,
          body,
          senderId,
        });
      })
    );
  }
};

// Send notification to a single user
export const sendSingleNotification = async (payload: {
  dataId?: string;
  receiverId?: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  body?: string;
}): Promise<void> => {
  await prisma.$transaction(async (prismaTx) => {
    const notification = await prismaTx.notification.create({
      data: {
        ...(payload.receiverId ? { receiverId: payload.receiverId } : {}),
        ...(payload.senderId ? { senderId: payload.senderId } : {}),
        ...(payload.dataId ? { dataId: payload.dataId } : {}),
        title: payload.title,
        type: payload.type,
        body: payload.body ?? "",
      },
    });

    if (payload.receiverId) {
      const user = await prismaTx.user.findUnique({
        where: {
          id: payload.receiverId,
        },
        select: {
          id: true,
          fcmToken: true,
        },
      });

      if (user?.fcmToken) {
        await pushNotification({
          fcmToken: user.fcmToken,
          title: payload.title,
          type: payload.type,
          notificationId: notification.id,
        });
      }
    }
  });
};

// push notification to user
export const pushNotification = async (payload: {
  fcmToken: string;
  title: string;
  // body: string;
  type: NotificationType;
  notificationId?: string;
}): Promise<void> => {
  const message = {
    notification: {
      title: payload.title,
      // body: payload.body,
      notificationId: payload.notificationId,
    },
    token: payload.fcmToken,
  };
  await admin.messaging().send(message);
};
