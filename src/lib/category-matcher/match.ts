/**
 * Category matching algorithm.
 * Given user text and a pre-built index, returns ranked category matches.
 *
 * Algorithm:
 * 1. Analyze the text into tokens.
 * 2. Split into "complete" tokens (all except the last while typing) and a "partial" trailing token.
 * 3. For each complete token: exact postings match → factor 1.0; else fuzzy match → factor 0.5.
 * 4. For the partial token: prefix scan of vocabulary → factor 0.6.
 * 5. Score each category = Σ (bestFieldWeight × factor × idf) over matched tokens.
 * 6. Return categories with score ≥ MIN_SCORE, sorted by score desc, then sortOrder, then name.
 */

import { analyze, countMeaningfulTokens } from "./analyze";
import type { CategoryIndex, IndexableCategory } from "./build-index";
import {
  FACTOR_EXACT,
  FACTOR_FUZZY,
  FACTOR_PREFIX,
  MIN_CHARS,
  MIN_MEANINGFUL_TOKENS,
  MIN_SCORE,
} from "./config";
import { fuzzyMatch } from "./fuzzy";

export interface RankedMatch {
  category: IndexableCategory;
  score: number;
  /** The user-input words that triggered this match (for "matched on" hints). */
  matchedWords: string[];
  /** Parent category name, if available. */
  parentName?: string;
}

export type MatchStatus =
  | "insufficient" // Below MIN_CHARS or MIN_MEANINGFUL_TOKENS
  | "matching" // Currently computing (unused for sync, but kept for API consistency)
  | "matched" // n > 0 matches found
  | "no-match"; // Enough text, zero results

export interface MatchResult {
  status: MatchStatus;
  matches: RankedMatch[];
  /** Total count of matches. */
  count: number;
}

/**
 * Match user text against the category index.
 * @param text - The user's description text
 * @param index - The pre-built category index
 * @param allWordsFinished - If true, treat all tokens as complete (e.g., on blur or when navigating to Step 2)
 */
export function matchCategories(
  text: string,
  index: CategoryIndex,
  allWordsFinished = false,
): MatchResult {
  // Check minimum thresholds
  if (text.length < MIN_CHARS) {
    return { status: "insufficient", matches: [], count: 0 };
  }

  const meaningfulCount = countMeaningfulTokens(text);
  if (meaningfulCount < MIN_MEANINGFUL_TOKENS) {
    return { status: "insufficient", matches: [], count: 0 };
  }

  const tokens = analyze(text);
  if (tokens.length === 0) {
    return { status: "insufficient", matches: [], count: 0 };
  }

  // Split into complete and partial tokens
  const endsWithWhitespace = /\s$/.test(text);
  let completeTokens = tokens;
  let partialToken: string | null = null;

  if (!allWordsFinished && !endsWithWhitespace && tokens.length > 0) {
    completeTokens = tokens.slice(0, -1);
    const lastToken = tokens[tokens.length - 1];
    if (lastToken.stemmed.length >= 3) {
      partialToken = lastToken.stemmed;
    }
  }

  // Per-token cache for efficiency
  const tokenCache = new Map<string, Map<string, { weight: number; factor: number }>>();

  // Score accumulator per category
  const scores = new Map<string, number>();
  const matchedWordsMap = new Map<string, Set<string>>();

  function addScore(categoryId: string, score: number, word: string) {
    scores.set(categoryId, (scores.get(categoryId) || 0) + score);
    let words = matchedWordsMap.get(categoryId);
    if (!words) {
      words = new Set();
      matchedWordsMap.set(categoryId, words);
    }
    words.add(word);
  }

  // Deduplicate complete tokens by their stemmed form
  const seenStems = new Set<string>();

  // Process complete tokens
  for (const token of completeTokens) {
    if (seenStems.has(token.stemmed)) continue;
    seenStems.add(token.stemmed);

    // Check cache
    let hits = tokenCache.get(token.stemmed);

    if (!hits) {
      hits = new Map();

      // Try exact match first
      const exactPostings = index.postings.get(token.stemmed);
      if (exactPostings) {
        for (const [catId, weight] of exactPostings) {
          hits.set(catId, { weight, factor: FACTOR_EXACT });
        }
      } else {
        // Fuzzy match fallback
        const fuzzyResults = fuzzyMatch(token.stemmed, index.vocabulary);
        for (const fuzzyResult of fuzzyResults) {
          const fuzzyPostings = index.postings.get(fuzzyResult.term);
          if (fuzzyPostings) {
            for (const [catId, weight] of fuzzyPostings) {
              const existing = hits.get(catId);
              if (!existing || weight * FACTOR_FUZZY > existing.weight * existing.factor) {
                hits.set(catId, { weight, factor: FACTOR_FUZZY });
              }
            }
          }
        }
      }

      tokenCache.set(token.stemmed, hits);
    }

    for (const [catId, { weight, factor }] of hits) {
      const idfVal = index.idf.get(token.stemmed) || 1;
      addScore(catId, weight * factor * idfVal, token.original);
    }
  }

  // Process partial token (prefix match)
  if (partialToken) {
    const prefixHits = new Map<string, { weight: number; factor: number }>();

    for (const vocabTerm of index.vocabulary) {
      if (vocabTerm.startsWith(partialToken)) {
        const postings = index.postings.get(vocabTerm);
        if (postings) {
          for (const [catId, weight] of postings) {
            const existing = prefixHits.get(catId);
            if (!existing || weight * FACTOR_PREFIX > existing.weight * existing.factor) {
              prefixHits.set(catId, { weight, factor: FACTOR_PREFIX });
            }
          }
        }
      }
    }

    for (const [catId, { weight, factor }] of prefixHits) {
      // Use the IDF of the best matching vocabulary term (approximate)
      addScore(catId, weight * factor, partialToken);
    }
  }

  // Filter by MIN_SCORE and sort
  const matches: RankedMatch[] = [];

  for (const [catId, score] of scores) {
    if (score < MIN_SCORE) continue;

    const category = index.categories.get(catId);
    if (!category) continue;

    matches.push({
      category,
      score,
      matchedWords: Array.from(matchedWordsMap.get(catId) || []),
      parentName: index.parentNames.get(catId),
    });
  }

  // Sort: score desc, then sortOrder asc, then name asc
  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.category.sortOrder !== b.category.sortOrder)
      return a.category.sortOrder - b.category.sortOrder;
    return a.category.name.localeCompare(b.category.name);
  });

  if (matches.length === 0) {
    return { status: "no-match", matches: [], count: 0 };
  }

  return {
    status: "matched",
    matches,
    count: matches.length,
  };
}
