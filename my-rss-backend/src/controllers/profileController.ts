import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const ProfileController = {
  async create(req: Request, res: Response) {
    try {
      const { name, avatar } = req.body;
      const profile = await prisma.profile.create({
        data: { name, avatar }
      });
      res.status(201).json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating profile.' });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const profiles = await prisma.profile.findMany();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: 'Error listing profiles.' });
    }
  }
};