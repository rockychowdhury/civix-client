/**
 * Build the search index from categories.
 * Index structure: for each selectable leaf category, index its name, synonyms,
 * parent name, and description with weighted postings.
 */

import { analyze } from "./analyze";
import { WEIGHT_DESCRIPTION, WEIGHT_NAME, WEIGHT_PARENT, WEIGHT_SYNONYM } from "./config";
import { getSynonyms } from "./synonyms";

export interface IndexableCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  department?: {
    id?: string;
    name?: string;
    code?: string;
  };
}

/** A single posting: which category, and the best field weight for this stem. */
export interface Posting {
  categoryId: string;
  weight: number;
}

export interface CategoryIndex {
  /** stem → Map<categoryId, bestFieldWeight> */
  postings: Map<string, Map<string, number>>;
  /** stem → IDF value (normalized to 0.25–1.0) */
  idf: Map<string, number>;
  /** Sorted array of all stems in the index, for prefix/fuzzy scanning. */
  vocabulary: string[];
  /** Map of category ID → category data for quick lookups. */
  categories: Map<string, IndexableCategory>;
  /** Map of category ID → parent name. */
  parentNames: Map<string, string>;
  /** Total number of selectable leaves. */
  leafCount: number;
}

/**
 * Determine if a category is a selectable leaf:
 * - Must be active
 * - Must have a parentId (i.e., is a child / leaf node)
 */
function isSelectableLeaf(
  category: IndexableCategory,
  allCategories: IndexableCategory[],
): boolean {
  if (!category.isActive) return false;
  // A leaf is one that has a parent (it's a child category).
  // We also check if nothing references this category as a parent.
  const hasChildren = allCategories.some((c) => c.parentId === category.id);
  return !hasChildren;
}

/**
 * Build the search index from a list of categories.
 */
export function buildIndex(allCategories: IndexableCategory[]): CategoryIndex {
  const postings = new Map<string, Map<string, number>>();
  const categoryMap = new Map<string, IndexableCategory>();
  const parentNames = new Map<string, string>();

  // Build parent lookup
  const parentLookup = new Map<string, IndexableCategory>();
  for (const cat of allCategories) {
    parentLookup.set(cat.id, cat);
    categoryMap.set(cat.id, cat);
  }

  // Identify selectable leaves
  const leaves = allCategories.filter((c) => isSelectableLeaf(c, allCategories));

  // Helper to add a token to the postings
  function addPosting(stemmed: string, categoryId: string, weight: number) {
    let catMap = postings.get(stemmed);
    if (!catMap) {
      catMap = new Map();
      postings.set(stemmed, catMap);
    }
    const existing = catMap.get(categoryId) || 0;
    catMap.set(categoryId, Math.max(existing, weight)); // max, not sum
  }

  for (const leaf of leaves) {
    // Index the leaf name (weight 1.0)
    const nameTokens = analyze(leaf.name);
    for (const token of nameTokens) {
      addPosting(token.stemmed, leaf.id, WEIGHT_NAME);
    }

    // Index synonyms by slug (weight 0.9)
    const synonyms = getSynonyms(leaf.slug);
    for (const synonym of synonyms) {
      const synTokens = analyze(synonym);
      for (const token of synTokens) {
        addPosting(token.stemmed, leaf.id, WEIGHT_SYNONYM);
      }
    }

    // Index parent name (weight 0.5)
    if (leaf.parentId) {
      const parent = parentLookup.get(leaf.parentId);
      if (parent) {
        parentNames.set(leaf.id, parent.name);
        const parentTokens = analyze(parent.name);
        for (const token of parentTokens) {
          addPosting(token.stemmed, leaf.id, WEIGHT_PARENT);
        }
      }
    }

    // Index description if present (weight 0.5)
    if (leaf.description) {
      const descTokens = analyze(leaf.description);
      for (const token of descTokens) {
        addPosting(token.stemmed, leaf.id, WEIGHT_DESCRIPTION);
      }
    }
  }

  // Compute IDF: ln(1 + N / df), normalized to 0.25–1.0
  const N = leaves.length;
  const idf = new Map<string, number>();

  if (N > 0) {
    // Find max raw IDF for normalization
    let maxRawIdf = 0;
    const rawIdfs = new Map<string, number>();

    for (const [stemmed, catMap] of postings) {
      const df = catMap.size; // document frequency = number of categories containing this stem
      const rawIdfVal = Math.log(1 + N / df);
      rawIdfs.set(stemmed, rawIdfVal);
      if (rawIdfVal > maxRawIdf) maxRawIdf = rawIdfVal;
    }

    // Normalize to 0.25–1.0
    for (const [stemmed, rawIdfVal] of rawIdfs) {
      const normalized = maxRawIdf > 0 ? 0.25 + 0.75 * (rawIdfVal / maxRawIdf) : 1;
      idf.set(stemmed, normalized);
    }
  }

  const vocabulary = Array.from(postings.keys()).sort();

  return {
    postings,
    idf,
    vocabulary,
    categories: categoryMap,
    parentNames,
    leafCount: leaves.length,
  };
}
