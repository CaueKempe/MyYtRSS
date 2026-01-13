import { Router } from 'express';
import { ProfileController } from '../controllers/profileController.js';

const router = Router();
router.post('/', ProfileController.create);
router.get('/', ProfileController.list);

export default router;