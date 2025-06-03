import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { partnerController } from "./partner.controller";
import { partnerValidation } from "./partner.validation";

const partnerRouter = express.Router();

partnerRouter.post(
  "/",
  auth(),
  validateRequest(partnerValidation.createSchema),
  partnerController.createPartner
);

partnerRouter.get("/", auth(), partnerController.getPartnerList);

// only partner profile
partnerRouter.get(
  "/profile",
  auth(UserRole.PARTNER),
  partnerController.getPartnerProfile
);

// Total User Linked
partnerRouter.get(
  "/users-linked",
  auth(UserRole.PARTNER),
  partnerController.usersLinked
);

// Total User Linked
partnerRouter.get(
  "/my-wallet",
  auth(UserRole.PARTNER),
  partnerController.myWallet
);

// view profile
partnerRouter.get(
  "/view-profile/:profileId",
  auth(),
  partnerController.viewProfile
);

// active plans user list
partnerRouter.get(
  "/active-plans",
  auth(UserRole.PARTNER),
  partnerController.activePlans
);

// year signup
partnerRouter.get(
  "/year-signup",
  auth(UserRole.PARTNER),
  partnerController.yearSignUp
);

partnerRouter.get("/:id", auth(), partnerController.getPartnerById);

partnerRouter.put(
  "/:id",
  auth(),
  validateRequest(partnerValidation.updateSchema),
  partnerController.updatePartner
);

partnerRouter.delete("/:id", auth(), partnerController.deletePartner);

export const partnerRoutes = partnerRouter;
