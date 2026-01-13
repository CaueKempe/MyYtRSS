import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { CategoryController } from '../controllers/categoryController.js';

const router: RouterType = Router();

router.post('/', CategoryController.create);
router.get('/tree', CategoryController.listTree);
router.patch('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;