import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

async function getAllCategoryIds(categoryId: string): Promise<string[]> {
    const ids: string[] = [categoryId];

    const children = await prisma.category.findMany({
        where: { 
            parentId: categoryId,
            active: true
        },
        select: { id: true }
    });

    for (const child of children) {
        const subIds = await getAllCategoryIds(child.id);
        ids.push(...subIds);
    }

    return ids;
}

export const ItemController = {
  async list(req: Request, res: Response) {
    try {
      const profileId = req.headers['x-profile-id'] as string;
      
      if (!profileId) {
        return res.status(400).json({ error: 'Profile ID is required in headers (x-profile-id).' });
      }

      const { sourceId, categoryId, type, limit, search, unreadOnly, cursor } = req.query;
      const take = Number(limit) || 50; 

      let categoryFilter = undefined;

      if (categoryId) {
          const allFamilyIds = await getAllCategoryIds(String(categoryId));
          
          categoryFilter = {
              categoryId: { in: allFamilyIds }
          };
      }

      const items = await prisma.item.findMany({
        take,
        ...(cursor ? { skip: 1, cursor: { id: String(cursor) } } : {}),
        where: {
          sourceId: sourceId ? String(sourceId) : undefined,
          
          source: {
              active: true,

              category: {
                  profileId: profileId 
              },

              ...categoryFilter,
          },

          type: type ? (String(type) as any) : undefined,
          title: search ? { contains: String(search), mode: 'insensitive' } : undefined,
          
          ...(unreadOnly === 'true' ? {
             statuses: {
                 none: {
                     profileId: profileId,
                     isRead: true
                 }
             }
          } : {})
        },
        include: {
          source: { select: { name: true, categoryId: true } },
          statuses: {
              where: { profileId: profileId },
              select: { isRead: true, playProgress: true, isFavorite: true }
          }
        },
        orderBy: { pubDate: 'desc' },
      });

      const nextCursor = items.length === take ? items[items.length - 1].id : null;

      res.json({
        items,
        nextCursor
      });
    } catch (error) {
      console.error("Error listing items:", error);
      res.status(500).json({ error: 'Internal Server Error while listing items.' });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profileId = req.headers['x-profile-id'] as string;
      
      const { isRead, playProgress, isFavorite } = req.body;

      if (!profileId) {
        return res.status(400).json({ error: 'Profile ID is required.' });
      }

      const status = await prisma.itemStatus.upsert({
        where: {
            profileId_itemId: {
                profileId: profileId,
                itemId: id
            }
        },
        update: {
            ...(isRead !== undefined && { isRead: Boolean(isRead) }),
            ...(playProgress !== undefined && { playProgress: Number(playProgress) }),
            ...(isFavorite !== undefined && { isFavorite: Boolean(isFavorite) }),
        },
        create: {
            profileId: profileId,
            itemId: id,
            isRead: isRead ? Boolean(isRead) : false,
            playProgress: playProgress ? Number(playProgress) : 0,
            isFavorite: isFavorite ? Boolean(isFavorite) : false
        }
      });

      res.json(status);
    } catch (error) {
        console.error("Error updating item status:", error);
      res.status(500).json({ error: 'Error updating item status.' });
    }
  },
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { duration } = req.body; 
      
      const profileId = req.headers['x-profile-id'] as string;
      if (!profileId) return res.status(400).json({ error: 'Profile ID required' });

      const item = await prisma.item.update({
        where: { id },
        data: {
          ...(duration !== undefined && { duration: Number(duration) }),
        }
      });

      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: 'Error updating item' });
    }
  }
};