import { prisma } from '../lib/prisma.js';
import { YoutubeService } from './youtubeService.js';

export const FetcherService = {
  async runAll() {
    const sources = await prisma.source.findMany();

    for (const source of sources) {
      if (source.type === 'YOUTUBE') {
        await YoutubeService.fetchAndSaveItems(source.id);
      }
      //...
    }
  }
};