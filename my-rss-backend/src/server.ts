import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';
import categoryRoutes from './routes/categoryRoutes.js';
import sourceRoutes from './routes/sourceRoutes.js';
import preferenceRoutes from './routes/preferencesRoute.js';
import { ItemController } from './controllers/itemController.js';
import { setupCron } from './lib/cron.js';
import profileRoutes from './routes/profileRoutes.js';

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/categories', categoryRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/profiles', profileRoutes);
app.patch('/api/items/:id', ItemController.update);
app.get('/api/items', ItemController.list);
app.patch('/api/items/:id/status', ItemController.updateStatus);

app.get('/health', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'OK', database: 'Connected' });
    } catch (e) {
        res.status(500).json({ status: 'Error', database: 'Disconnected' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    setupCron();
});