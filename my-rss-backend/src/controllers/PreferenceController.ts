import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const PreferenceController = {
  async get(req: Request, res: Response) {
    try {

      const { profileId, key } = req.params;
      
      const pref = await prisma.preference.findUnique({
        where: {
          profileId_key: {
            profileId,
            key
          }
        }
      });

      if (!pref) {
        return res.json(null);
      }

      try {
        return res.json(JSON.parse(pref.value));
      } catch (e) {
        return res.json(pref.value);
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching preference.' });
    }
  },

  async save(req: Request, res: Response) {
    try {
      const { profileId, key } = req.params;
      const { value } = req.body;

      const stringValue = JSON.stringify(value);

      const pref = await prisma.preference.upsert({
        where: {
          profileId_key: {
            profileId,
            key
          }
        },
        update: { value: stringValue },
        create: { 
          profileId, 
          key, 
          value: stringValue 
        }
      });

      res.json(pref);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error saving preference.' });
    }
  }
};