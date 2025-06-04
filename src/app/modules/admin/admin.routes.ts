import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { adminController } from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { adminValidation } from "./admin.validation";

const router = express.Router();

// router.post(
//   "/",
//   auth(),
//   validateRequest(adminValidation.createSchema),
//   adminController.createAdmin
// );

router.get(
  "/home",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminController.getAdminList
);

// Total sales
router.get("/total-sales", auth(), adminController.totalSales);

// Partner Manage
router.get(
  "/partner-manage",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminController.partnerManage
);

// Partner Manage
router.get(
  "/notification",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminController.adminNotification
);

// Partner Manage
router.get(
  "/get-single-partner/:profileId",
  // auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminController.partnerSingleProfile
);

// router.get("/:id", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminController.getAdminList);

// router.put(
//   "/:id",
//   auth(),
//   validateRequest(adminValidation.updateSchema),
//   adminController.updateAdmin
// );

// router.delete("/:id", auth(), adminController.deleteAdmin);

export const adminRoutes = router;
