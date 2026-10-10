import { useMemo } from "react";
import type { CategoryIndex, IndexableCategory } from "@/lib/category-matcher";
import { buildIndex } from "@/lib/category-matcher";

/**
 * Build the category search index once when the category list changes.
 * The index is expensive to create but immutable — `useMemo` ensures it's computed once.
 */
export function useCategoryIndex(categories: IndexableCategory[]): CategoryIndex | null {
  return useMemo(() => {
    if (!categories || categories.length === 0) return null;
    return buildIndex(categories);
  }, [categories]);
}
