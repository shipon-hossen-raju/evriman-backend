import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { adminController } from "./admin.controller";
import { adminValidation } from "./admin.validation";
import { UserRole } from "@prisma/client";

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

// router.get("/:id", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminController.getAdminList);

// router.put(
//   "/:id",
//   auth(),
//   validateRequest(adminValidation.updateSchema),
//   adminController.updateAdmin
// );

// router.delete("/:id", auth(), adminController.deleteAdmin);

export const adminRoutes = router;
