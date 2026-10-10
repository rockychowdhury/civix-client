/**
 * Text analysis pipeline: normalize → tokenize → filter stopwords → stem.
 * Handles mixed Latin/non-Latin (Bangla) text with Unicode property classes.
 */

import { stem } from "./stem";
import { isStopword } from "./stopwords";

/** Minimum token length for Latin-script tokens. */
const MIN_LATIN_TOKEN_LEN = 3;

/** Minimum token length for non-Latin tokens (e.g., Bangla). */
const MIN_NON_LATIN_TOKEN_LEN = 2;

/** Unicode-aware tokenizer: splits on anything that is not a letter or digit. */
const TOKEN_RE = /[\p{L}\p{N}]+/gu;

const LATIN_RE = /^[\u0041-\u005A\u0061-\u007A\u00C0-\u024F]+$/;

export interface AnalyzedToken {
  /** The original lowercased token. */
  original: string;
  /** The stemmed form of the token (same as original for non-Latin). */
  stemmed: string;
}

/**
 * Analyze a text string into an array of meaningful tokens.
 * - Lowercases everything
 * - Tokenizes with Unicode support
 * - Drops stopwords
 * - Drops tokens shorter than the minimum length
 * - Stems Latin-script tokens
 */
export function analyze(text: string): AnalyzedToken[] {
  const lower = text.toLowerCase();
  const rawTokens = lower.match(TOKEN_RE) || [];
  const result: AnalyzedToken[] = [];

  for (const token of rawTokens) {
    if (isStopword(token)) continue;

    const isLatin = LATIN_RE.test(token);
    const minLen = isLatin ? MIN_LATIN_TOKEN_LEN : MIN_NON_LATIN_TOKEN_LEN;

    if (token.length < minLen) continue;

    result.push({
      original: token,
      stemmed: isLatin ? stem(token) : token,
    });
  }

  return result;
}

/**
 * Count the number of meaningful (non-stopword) tokens in a text string.
 * Used to check the MIN_MEANINGFUL_TOKENS threshold.
 */
export function countMeaningfulTokens(text: string): number {
  return analyze(text).length;
}
