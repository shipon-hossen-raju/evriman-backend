import express from "express";
import auth from "../../middlewares/auth";
import { notificationController } from "./notification.controller";

const router = express.Router();

router.get("/me", auth(), notificationController.getNotificationList);

// view notification by id
router.get("/:id", auth(), notificationController.getNotificationById);

export const notificationRoutes = router;
