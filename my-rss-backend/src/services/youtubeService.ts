import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
import { prisma } from '../lib/prisma.js';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true 
});

function detectItemType(link: string): 'SHORT' | 'LIVE' | 'VIDEO' {
  if (link.includes('/shorts/')) return 'SHORT';
  if (link.includes('/live/')) return 'LIVE';
  return 'VIDEO';
}

function shouldSkipItem(type: 'SHORT' | 'LIVE' | 'VIDEO', source: any): boolean {
  if (type === 'SHORT' && !source.wantShorts) return true;
  if (type === 'VIDEO' && !source.wantVideos) return true;
  if (type === 'LIVE' && !source.wantLives) return true;
  return false;
}

export const YoutubeService = {
  
  async resolveChannelToRss(url: string): Promise<string> {
    if (url.includes('videos.xml')) return url;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error resolving channel: ${response.status}`);
      
      const html = await response.text();
      const $ = cheerio.load(html);
      const rssUrl = $('link[rel="alternate"][type="application/rss+xml"]').attr('href');

      if (!rssUrl) throw new Error('Could not find RSS Feed for this channel.');
      return rssUrl;
    } catch (error) {
      console.error('Error resolving YouTube URL:', error);
      throw error;
    }
  },

  async fetchAndSaveItems(source: any) { 
    if (!source || !source.rssUrl) return { count: 0 };

    try {
      const response = await fetch(source.rssUrl, {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

      const xmlText = await response.text();
      const jsonObj = xmlParser.parse(xmlText);
      
      const entries = jsonObj.feed?.entry;
      if (!entries) return { count: 0 };

      const videos = Array.isArray(entries) ? entries : [entries];
      let savedCount = 0;

      for (const video of videos) {
        const videoLink = video.link?.href || "";
        const currentItemType = detectItemType(videoLink);

        if (shouldSkipItem(currentItemType, source)) continue;

        const thumb = video.group?.thumbnail?.url;
        const description = video.group?.description || "";
        
        const pubDate = video.published ? new Date(video.published) : new Date();

        await prisma.item.upsert({
          where: { 
            sourceId_link: {
                sourceId: source.id,
                link: videoLink
            }
          },
          update: {
            title: video.title,
            thumbnail: thumb,
            description: description,
            type: currentItemType,
          },
          create: {
            title: video.title || 'Untitled',
            link: videoLink,
            description: description,
            pubDate: pubDate,
            thumbnail: thumb,
            type: currentItemType,
            sourceId: source.id,
          }
        });
        savedCount++;
      }

      await prisma.source.update({
        where: { id: source.id },
        data: { 
          lastFetch: new Date(),
          lastHttpStatus: response.status,
          errorMessage: null,
          failCount: 0,
          active: true
        }
      });

      console.log(`✅ [${source.name}] Synced. Items processed: ${savedCount}`);
      return { count: savedCount };

    } catch (error: any) {
      console.error(`❌ Error in source [${source.name}]:`, error.message);

      await prisma.source.update({
        where: { id: source.id },
        data: {
          lastFetch: new Date(),
          lastHttpStatus: error.message.includes('HTTP Error') ? parseInt(error.message.split(' ')[2]) : 500,
          errorMessage: String(error.message).substring(0, 250), 
          failCount: { increment: 1 } 
        }
      });

      throw error; 
    }
  }
};