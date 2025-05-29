import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

const router = express.Router();

router.post(
  "/create",
  auth(),
//   validateRequest(paymentValidation.createSchema),
  paymentController.createPayment
);

// create payment request
router.post(
   "/create-payment-request",
   auth(),
  validateRequest(paymentValidation.createPaymentRequest),
  paymentController.createPaymentRequest
);

router.get("/", auth(), paymentController.getPaymentList);

router.get("/:id", auth(), paymentController.getPaymentById);

router.put(
  "/:id",
  auth(),
  validateRequest(paymentValidation.updateSchema),
  paymentController.updatePayment
);

router.delete("/:id", auth(), paymentController.deletePayment);

export const paymentRoutes = router;
