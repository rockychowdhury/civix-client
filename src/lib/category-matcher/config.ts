/**
 * Category matcher configuration.
 * All thresholds in one place — tune without touching the algorithm.
 */

/** Minimum characters before matching starts. */
export const MIN_CHARS = 15;

/** Minimum meaningful (non-stopword, stemmed) tokens required. */
export const MIN_MEANINGFUL_TOKENS = 2;

/** Minimum score for a category to appear in results. */
export const MIN_SCORE = 0.5;

/** Debounce delay (ms) for the description textarea. */
export const DEBOUNCE_MS = 250;

/** Debounce delay (ms) for the manual search within Step 2. */
export const SEARCH_DEBOUNCE_MS = 200;

/** Delay before showing the "no match" message. */
export const NO_MATCH_MESSAGE_DELAY_MS = 800;

/**
 * Fuzzy matching: maximum Levenshtein edit distance by word length.
 *  - ≤3 chars → 0 edits (exact only)
 *  - 4–7 chars → 1 edit
 *  - ≥8 chars → 2 edits
 */
export function maxEditsForLength(len: number): number {
  if (len <= 3) return 0;
  if (len <= 7) return 1;
  return 2;
}

/** Weight factors for match provenance. */
export const FACTOR_EXACT = 1.0;
export const FACTOR_FUZZY = 0.5;
export const FACTOR_PREFIX = 0.6;

/** Field weights for index building. */
export const WEIGHT_NAME = 1.0;
export const WEIGHT_SYNONYM = 0.9;
export const WEIGHT_PARENT = 0.5;
export const WEIGHT_DESCRIPTION = 0.5;
