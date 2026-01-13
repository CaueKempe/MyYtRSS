import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Category, Source, Item } from '../types';

function flattenCategories(nodes: Category[]): Category[] {
  let flat: Category[] = [];
  nodes.forEach(node => {
    flat.push({ id: node.id, name: node.name });
    if (node.children && node.children.length > 0) {
      flat = [...flat, ...flattenCategories(node.children)];
    }
  });
  return flat;
}

export function useNavigation() {
  const profileId = localStorage.getItem('RSS_profile_id');

  const categoriesQuery = useQuery({
    queryKey: ['categories', profileId],
    queryFn: async () => {
      const response = await api.get('/categories/tree');
      return response.data as Category[];
    },
    enabled: !!profileId,
  });

  const sourcesQuery = useQuery<Source[]>({
    queryKey: ['sources', profileId],
    queryFn: async () => (await api.get('/sources')).data,
    enabled: !!profileId,
  });

  const treeData = categoriesQuery.data || [];
  const flatData = flattenCategories(treeData);

  const getCategoryFamilyIds = (categoryId: string): string[] => {
    const familyIds: string[] = [categoryId];

    const collectDescendants = (node: Category, targetId: string, collecting: boolean) => {
        let isTarget = collecting || node.id === targetId;
        
        if (isTarget) {
            if (!familyIds.includes(node.id)) familyIds.push(node.id);
        }

        if (node.children) {
            node.children.forEach(child => collectDescendants(child, targetId, isTarget));
        }
    }

    treeData.forEach(node => collectDescendants(node, categoryId, false));
    return familyIds;
  };

  const enrichItems = (items: Item[]) => {
    if (!sourcesQuery.data) return items;
    return items.map(item => {
      const sourceInfo = sourcesQuery.data.find(s => s.id === item.sourceId);
      return {
        ...item,
        source: {
          ...item.source,
          name: item.source?.name || sourceInfo?.name || '',
          categoryId: sourceInfo?.categoryId || ''
        }
      };
    });
  };

  return {
    categoriesTree: treeData,
    categories: flatData,
    sources: sourcesQuery.data || [],
    enrichItems,
    getCategoryFamilyIds,
    isLoading: categoriesQuery.isLoading || sourcesQuery.isLoading,
  };
}