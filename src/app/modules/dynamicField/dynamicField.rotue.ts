
import express from 'express';
import dynamicFieldController from './dynamicField.controller';
import validateRequest from '../../middlewares/validateRequest';
import { dynamicFieldSchema } from './dynamicField.validation';

const dynamicFieldRoute = express.Router();

// Route to create a dynamic field
dynamicFieldRoute.post(
  "/create",
  validateRequest(dynamicFieldSchema),
  dynamicFieldController.createDynamicField
);

export default dynamicFieldRoute;
