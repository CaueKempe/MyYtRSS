import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { PreferenceController } from '../controllers/PreferenceController.js';

const router: RouterType = Router();

router.get('/:profileId/:key', PreferenceController.get);
router.post('/:profileId/:key', PreferenceController.save);

export default router;