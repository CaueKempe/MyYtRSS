import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const CategoryController = {
    async create(req: Request, res: Response) {
        try {
            const profileId = req.headers['x-profile-id'] as string;
            if (!profileId) return res.status(400).json({ error: 'Profile ID is required.' });

            const { name, parentId } = req.body;
            
            const category = await prisma.category.create({
                data: { 
                    name, 
                    parentId: parentId || null,
                    profileId
                },
            });
            
            res.status(201).json(category);
        } catch (error) {
            console.error("Error creating category:", error);
            res.status(500).json({ error: 'Error creating category.' });
        }
    },

    async listTree(req: Request, res: Response) {
        try {
            const profileId = req.headers['x-profile-id'] as string;
            if (!profileId) return res.status(400).json({ error: 'Profile ID is required.' });

            const categories = await prisma.category.findMany({
                where: { 
                    parentId: null, 
                    profileId,
                    active: true 
                }, 
                include: {
                    children: {
                        where: { active: true },
                        include: {
                            children: { 
                                where: { active: true } 
                            } 
                        }
                    }
                }
            });
            res.json(categories);
        } catch (error) {
            console.error("Error listing category tree:", error);
            res.status(500).json({ error: 'Error listing category tree.' });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const profileId = req.headers['x-profile-id'] as string;
            const { id } = req.params;
            const { name, parentId } = req.body;

            if (!profileId) return res.status(400).json({ error: 'Profile ID is required.' });

            const category = await prisma.category.update({
                where: { 
                    id,
                    profileId 
                },
                data: {
                    name,
                    parentId
                }
            });

            res.json(category);
        } catch (error) {
            console.error("Error updating category:", error);
            res.status(500).json({ error: 'Error updating category.' });
        }
    },

    async delete(req: Request, res: Response) {
        try {
            const profileId = req.headers['x-profile-id'] as string;
            const { id } = req.params;

            if (!profileId) return res.status(400).json({ error: 'Profile ID is required.' });

            await prisma.category.update({
                where: { 
                    id,
                    profileId
                },
                data: { active: false }
            });

            res.status(204).send();
        } catch (error) {
            console.error("Error deleting category:", error);
            res.status(500).json({ error: 'Error deleting category.' });
        }
    }
};