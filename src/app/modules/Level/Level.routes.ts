import express from 'express';
import auth from '../../middlewares/auth';
import { LevelController } from './Level.controller';


const router = express.Router();

router.post(
'/',
auth(),
// validateRequest(LevelValidation.createSchema),
LevelController.createLevel,
);

router.get('/', auth(), LevelController.getLevelList);

router.get('/:id', auth(), LevelController.getLevelById);

router.put(
'/:id',
auth(),
// validateRequest(LevelValidation.updateSchema),
LevelController.updateLevel,
);

router.delete('/:id', auth(), LevelController.deleteLevel);

export const LevelRoutes = router;