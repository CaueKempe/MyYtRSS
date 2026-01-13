export interface Profile {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Category[];
}

export interface Source {
  id: string;
  name: string;
  url: string;
  categoryId: string;
  category?: Category;
  wantVideos?: boolean;
  wantShorts?: boolean;
  wantLives?: boolean;
}

export interface ItemStatus {
  isRead: boolean;
  playProgress: number;
  isFavorite: boolean;
}

export interface Item {
  id: string;
  title: string;
  link: string;
  description?: string;
  pubDate: string;
  thumbnail?: string;
  type: 'VIDEO' | 'SHORT' | 'LIVE';
  sourceId: string;
  
  duration?: number;
  statuses?: ItemStatus[];

  isRead?: boolean; 

  source?: {
    name: string;
    categoryId: string;
  };
}