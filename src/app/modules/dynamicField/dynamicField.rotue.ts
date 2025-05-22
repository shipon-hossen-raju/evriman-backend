
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

// Route to get all dynamic fields
dynamicFieldRoute.get(
  "/all",
  dynamicFieldController.getAllDynamicFields
);

// Route to get a dynamic field by ID
dynamicFieldRoute.get(
   "/:id",
   dynamicFieldController.getDynamicFieldById
);
   
// Route to update a dynamic field
dynamicFieldRoute.patch(
  "/:id",
  validateRequest(dynamicFieldSchema),
  dynamicFieldController.updateDynamicField
);

// Route to delete a dynamic field
dynamicFieldRoute.delete(
  "/:id",
  dynamicFieldController.deleteDynamicField
);

export default dynamicFieldRoute;
