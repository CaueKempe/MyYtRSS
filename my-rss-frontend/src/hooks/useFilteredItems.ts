import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Item } from '../types';
import type { ContentType, DateFilterType, SortOrder } from '../components/layout/Header';

export function useFilterState() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [filterType, setFilterType] = useState<ContentType>('VIDEO');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('ALL');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchScope, setSearchScope] = useState<'title' | 'source'>('title');

  const resetFilters = () => {
    setSearchTerm('');
    setUnreadOnly(false);
    setFilterType('VIDEO');
    setDateFilter('ALL');
    setCustomDateStart('');
    setCustomDateEnd('');
    setSortOrder('newest');
  };

  return {
    selectedCategory, setSelectedCategory,
    selectedSource, setSelectedSource,
    searchTerm, setSearchTerm,
    unreadOnly, setUnreadOnly,
    filterType, setFilterType,
    dateFilter, setDateFilter,
    customDateStart, setCustomDateStart,
    customDateEnd, setCustomDateEnd,
    sortOrder, setSortOrder,
    searchScope, setSearchScope,
    resetFilters
  };
}

export function useFilterLogic(
  enrichedItems: Item[], 
  getCategoryFamilyIds: (id: string) => string[],
  filters: ReturnType<typeof useFilterState> 
) {
  
  const filteredItems = useMemo(() => {
    let result = enrichedItems;

    if (filters.selectedCategory && !filters.selectedSource) {
      const familyIds = getCategoryFamilyIds(filters.selectedCategory);
      result = result.filter(item => {
        const catId = item.source?.categoryId;
        return catId ? familyIds.includes(catId) : false;
      });
    } else if (filters.selectedSource) {
      result = result.filter(item => item.sourceId === filters.selectedSource);
    }

    if (filters.filterType !== 'ALL') {
        result = result.filter(item => item.type === filters.filterType);
    }

    if (filters.dateFilter !== 'ALL') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      result = result.filter(item => {
        const itemDate = new Date(item.pubDate);
        if (filters.dateFilter === '7_DAYS') {
          const limit = new Date(now);
          limit.setDate(limit.getDate() - 7);
          return itemDate >= limit;
        }
        if (filters.dateFilter === '15_DAYS') {
          const limit = new Date(now);
          limit.setDate(limit.getDate() - 15);
          return itemDate >= limit;
        }
        if (filters.dateFilter === '30_DAYS') {
          const limit = new Date(now);
          limit.setDate(limit.getDate() - 30);
          return itemDate >= limit;
        }
        if (filters.dateFilter === 'CUSTOM' && filters.customDateStart && filters.customDateEnd) {
          const start = new Date(filters.customDateStart + "T00:00:00");
          const end = new Date(filters.customDateEnd + "T23:59:59");
          return itemDate >= start && itemDate <= end;
        }
        return true;
      });
    }

    const term = filters.searchTerm.trim();
    if (term.length > 0) {
      const fuse = new Fuse(result, {
        keys: [
            { name: 'title', weight: 0.7 },
            { name: 'source.name', weight: 0.4 }
        ],
        threshold: 0.3,
        distance: 100,
        ignoreLocation: true
      });
      result = fuse.search(term).map(r => r.item);
    }

    return [...result].sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return filters.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  }, [enrichedItems, filters, getCategoryFamilyIds]);

  return filteredItems;
}