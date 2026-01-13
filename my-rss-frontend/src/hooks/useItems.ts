import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useItems(filters: any) {
  const profileId = localStorage.getItem('RSS_profile_id');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['items', filters.selectedCategory, filters.selectedSource, filters.unreadOnly, filters.searchTerm, filters.filterType, profileId],
    
    queryFn: async ({ pageParam = null }) => {
      const params = new URLSearchParams();
      
      if (filters.selectedSource) params.append('sourceId', filters.selectedSource);
      if (filters.selectedCategory) params.append('categoryId', filters.selectedCategory);
      if (filters.unreadOnly) params.append('unreadOnly', 'true');
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      
      if (filters.filterType && filters.filterType !== 'ALL') {
        params.append('type', filters.filterType);
      }

      if (pageParam) params.append('cursor', pageParam);
      params.append('limit', '50');

      const response = await api.get(`/items?${params.toString()}`);
      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    enabled: !!profileId,
  });

  const allItems = data?.pages.flatMap(page => page.items) ?? [];

  return {
    rawItems: allItems,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}