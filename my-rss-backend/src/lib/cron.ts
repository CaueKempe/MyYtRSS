import cron from 'node-cron';
import { prisma } from './prisma.js';
import { YoutubeService } from '../services/youtubeService.js';

export function setupCron() {
  cron.schedule('0 * * * *', async () => {
    console.log('🤖 Cron: Starting automatic sync...');
    
    const sources = await prisma.source.findMany();

    for (const source of sources) {
      try {
        if (source.type === 'YOUTUBE') {
          await YoutubeService.fetchAndSaveItems(source);
        }
      } catch (error) {
        console.error(`❌ Cron error for source ${source.name}:`, error);
      }
    }

    console.log('🤖 Cron: Sync finished.');
  });
}