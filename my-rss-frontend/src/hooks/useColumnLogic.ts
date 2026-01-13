import { useMemo } from "react";
import type { Category, Source, Item } from "../types";

export function useColumnLogic(
categories: Category[], sources: Source[], _unusedItems: Item[], selectedCategory: string | null, selectedSource: string | null,
) {
  return useMemo(() => {
    const findCategoryInTree = (nodes: Category[], id: string): Category | undefined => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findCategoryInTree(node.children, id);
          if (found) return found;
        }
      }
      return undefined;
    };

    if (selectedSource) {
      const src = sources.find(s => s.id === selectedSource);
      return src ? [{ id: src.id, source: src }] : [];
    }

    if (selectedCategory) {
      const currentCat = findCategoryInTree(categories, selectedCategory);
      const children = (currentCat?.children && currentCat.children.length > 0)
        ? currentCat.children 
        : categories.filter(c => c.parentId === selectedCategory);

      const subCategoryColumns = children.map(sub => ({
        id: sub.id,
        name: sub.name,
        isCategory: true
      }));

      const directSourceColumns = sources
        .filter(s => s.categoryId === selectedCategory)
        .map(source => ({
          id: source.id,
          source: source
        }));

      return [...subCategoryColumns, ...directSourceColumns];
    }

    return categories
      .filter(cat => !cat.parentId)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        isCategory: true
      }));

  }, [categories, sources, selectedCategory, selectedSource]);
}