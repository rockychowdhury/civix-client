/**
 * Category matcher barrel export.
 * Pure TypeScript, no React, no browser APIs.
 */

export { analyze, countMeaningfulTokens } from "./analyze";
export type { CategoryIndex, IndexableCategory } from "./build-index";
export { buildIndex } from "./build-index";
export {
  DEBOUNCE_MS,
  MIN_CHARS,
  MIN_MEANINGFUL_TOKENS,
  MIN_SCORE,
  NO_MATCH_MESSAGE_DELAY_MS,
  SEARCH_DEBOUNCE_MS,
} from "./config";
export type { MatchResult, MatchStatus, RankedMatch } from "./match";
export { matchCategories } from "./match";
