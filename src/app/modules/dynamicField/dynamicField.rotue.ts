
import express from 'express';
import dynamicFieldController from './dynamicField.controller';
import validateRequest from '../../middlewares/validateRequest';
import { dynamicFieldSchema } from './dynamicField.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const dynamicFieldRoute = express.Router();

// Route to create a dynamic field
dynamicFieldRoute.post(
  "/create",
  auth(UserRole.ADMIN),
  validateRequest(dynamicFieldSchema),
  dynamicFieldController.createDynamicField
);

// Route to get all dynamic fields
dynamicFieldRoute.get(
  "/all",
  auth(UserRole.ADMIN),
  dynamicFieldController.getAllDynamicFields
);

// Route to get all dynamic fields
dynamicFieldRoute.get(
  "/",
  auth(),
  dynamicFieldController.getAllDynamicFieldsPublish
);

// Route to get a dynamic field by ID
dynamicFieldRoute.get(
  "/:id",
  auth(),
  dynamicFieldController.getDynamicFieldById
);
   
// Route to update a dynamic field
dynamicFieldRoute.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(dynamicFieldSchema),
  dynamicFieldController.updateDynamicField
);

// Route to delete a dynamic field
dynamicFieldRoute.delete(
  "/:id",
  auth(UserRole.ADMIN),
  dynamicFieldController.deleteDynamicField
);

export default dynamicFieldRoute;
