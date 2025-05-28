
import express from "express";
import offerCodeController from "./offerCode.controller";
import validateRequest from "../../middlewares/validateRequest";
import { offerCodeSchema } from "./offerCode.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Route to create a new offer code
router.post(
  "/create",
  auth(UserRole.ADMIN),
  validateRequest(offerCodeSchema),
  offerCodeController.createOfferCode
);

// Route to get all offer codes
router.get(
  "/all",
  auth(),
  offerCodeController.getAllOfferCodes
);

// Route to get a single offer code by ID
router.get(
  "/:id",
  auth(),
  offerCodeController.getSingleOfferCode
);

// Route to update an offer code by ID
router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(offerCodeSchema),
  offerCodeController.updateOfferCode
);

const offerCodeRoutes = router;

export default offerCodeRoutes;