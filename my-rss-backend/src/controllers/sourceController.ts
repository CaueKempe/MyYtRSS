import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { YoutubeService } from '../services/youtubeService.js';

export const SourceController = {
  async create(req: Request, res: Response) {
    try {
      const { 
        name, url, categoryId, type, 
        wantVideos, wantShorts, wantLives 
      } = req.body;

      let finalRssUrl = url;

      if (type === 'YOUTUBE') {
        finalRssUrl = await YoutubeService.resolveChannelToRss(url);
      }

      const source = await prisma.source.create({
        data: {
          name, type, url,          
          rssUrl: finalRssUrl, 
          categoryId,
          wantVideos: wantVideos ?? true,
          wantShorts: wantShorts ?? false,
          wantLives: wantLives ?? true,
        },
      });

      res.status(201).json(source);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating source.' });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const sources = await prisma.source.findMany({
        include: { 
          category: true,
          _count: { select: { items: true } } 
        },
        orderBy: { name: 'asc' }
      });
      res.json(sources);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error listing sources.' });
    }
  },

  async sync(req: Request, res: Response) {
    try {
      console.log("🔄 Starting manual sync...");
      const sources = await prisma.source.findMany();
      
      if (sources.length === 0) {
        return res.json({ message: 'No sources to sync.' });
      }

      const results = await Promise.allSettled(
        sources.map(async (source) => {
          return await YoutubeService.fetchAndSaveItems(source); 
        })
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      res.json({ 
        message: 'Sync completed', 
        stats: { success: successCount, failed: failCount } 
      });
    } catch (error) {
      console.error("Fatal sync error:", error);
      res.status(500).json({ error: 'Internal sync error.' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { wantVideos, wantShorts, wantLives, categoryId, name } = req.body;

      const source = await prisma.source.update({
        where: { id },
        data: {
          name,
          categoryId,
          wantVideos: wantVideos !== undefined ? Boolean(wantVideos) : undefined,
          wantShorts: wantShorts !== undefined ? Boolean(wantShorts) : undefined,
          wantLives: wantLives !== undefined ? Boolean(wantLives) : undefined,
        },
      });

      res.json(source);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating source.' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.source.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting source:", error);
      res.status(500).json({ error: 'Error removing source. Check if ID exists.' });
    }
  },

  async importBulk(req: Request, res: Response) {
    try {
      const profileId = req.headers['x-profile-id'] as string;
      const { sources } = req.body; //[{ name, url, categoryName, type }]

      if (!profileId) {
        return res.status(400).json({ error: 'Profile ID is required (header x-profile-id).' });
      }

      if (!Array.isArray(sources)) {
        return res.status(400).json({ error: 'Body must contain a "sources" array.' });
      }

      console.log(`📦 Starting bulk import of ${sources.length} sources for profile ${profileId}...`);

      const results = [];

      for (const item of sources) {
        try {
          let category = await prisma.category.findFirst({
            where: { 
              name: item.categoryName,
              profileId: profileId 
            }
          });

          if (!category) {
            console.log(`Category "${item.categoryName}" not found. Creating...`);
            category = await prisma.category.create({
              data: {
                name: item.categoryName,
                profileId: profileId,
                active: true
              }
            });
          }

          let finalRssUrl = item.url;
          if (item.type === 'YOUTUBE') {
            finalRssUrl = await YoutubeService.resolveChannelToRss(item.url);
          }
          
          const source = await prisma.source.upsert({
            where: { 
                categoryId_rssUrl: {
                    categoryId: category.id,
                    rssUrl: finalRssUrl
                }
            },
            update: {
              categoryId: category.id,
              active: true
            },
            create: {
              name: item.name,
              url: item.url,
              rssUrl: finalRssUrl,
              type: item.type || 'YOUTUBE',
              categoryId: category.id,
              wantVideos: true,
              wantShorts: true, 
              wantLives: true
            }
          });

          results.push({ name: source.name, status: 'Created/Updated' });
          console.log(`✅ Imported: ${source.name}`);

        } catch (err) {
          console.error(`❌ Error importing ${item.name}:`, err);
          results.push({ name: item.name, status: 'Failed', error: String(err) });
        }
      }

      res.json({ message: 'Bulk import finished', results });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Fatal error during bulk import.' });
    }
  },
};