
import express from "express";
import offerCodeController from "./offerCode.controller";
import validateRequest from "../../middlewares/validateRequest";
import { OfferCodeSchema } from "./offerCode.validation";

const router = express.Router();

router.post("/create", validateRequest(OfferCodeSchema), offerCodeController.createOfferCode);

const offerCodeRoutes = router;

export default offerCodeRoutes;