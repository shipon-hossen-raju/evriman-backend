import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { partnerController } from './partner.controller';
import { partnerValidation } from './partner.validation';
import { UserRole } from '@prisma/client';

const partnerRouter = express.Router();

partnerRouter.post(
'/',
auth(),
validateRequest(partnerValidation.createSchema),
partnerController.createPartner,
);

partnerRouter.get('/', auth(), partnerController.getPartnerList);

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

// view profile
partnerRouter.get(
  "/view-profile/:profileId",
  auth(UserRole.PARTNER),
  partnerController.viewProfile
);

partnerRouter.get('/:id', auth(), partnerController.getPartnerById);

partnerRouter.put(
'/:id',
auth(),
validateRequest(partnerValidation.updateSchema),
partnerController.updatePartner,
);

partnerRouter.delete('/:id', auth(), partnerController.deletePartner);

export const partnerRoutes = partnerRouter;