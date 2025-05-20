
import express from "express";
import offerCodeController from "./offerCode.controller";
import validateRequest from "../../middlewares/validateRequest";
import { offerCodeSchema } from "./offerCode.validation";

const router = express.Router();

// Route to create a new offer code
router.post(
  "/create",
  validateRequest(offerCodeSchema),
  offerCodeController.createOfferCode
);

// Route to get all offer codes
router.get(
  "/all",
  offerCodeController.getAllOfferCodes
);

const offerCodeRoutes = router;

export default offerCodeRoutes;