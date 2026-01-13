import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { SourceController } from '../controllers/sourceController.js';
import { YoutubeService } from '../services/youtubeService.js';
import { prisma } from '../lib/prisma.js';

const router: RouterType = Router();

router.post('/', SourceController.create);
router.get('/', SourceController.list);
router.post('/sync', SourceController.sync);

router.patch('/:id', SourceController.update);
router.delete('/:id', SourceController.delete);

router.post('/bulk-import', SourceController.importBulk);

router.post('/:id/sync', async (req, res) => {
  try {
    const { id } = req.params;
    const source = await prisma.source.findUnique({ where: { id } });

    if (!source) {
      return res.status(404).json({ error: "Source not found" });
    }

    const result = await YoutubeService.fetchAndSaveItems(source);
    res.json({ message: "Sync completed!", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sync failed" });
  }
});

export default router;