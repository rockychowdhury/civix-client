/**
 * Lightweight English suffix-stripping stemmer.
 * Reduces inflected words to a common root (e.g. "leaking" / "leaks" / "leakage" → "leak").
 * Does not stem non-Latin scripts.
 */

const SUFFIX_RULES: [string, string][] = [
  // Order matters — longer suffixes first
  ["ational", "ate"],
  ["tional", "tion"],
  ["encies", "ence"],
  ["ancies", "ance"],
  ["nesses", "ness"],
  ["ments", "ment"],
  ["ously", "ous"],
  ["ively", "ive"],
  ["ation", "ate"],
  ["ement", "e"],
  ["ities", "ity"],
  ["ables", "able"],
  ["ibles", "ible"],
  ["ings", ""],
  ["ness", ""],
  ["ment", ""],
  ["ence", ""],
  ["ance", ""],
  ["ious", ""],
  ["eous", ""],
  ["ages", "age"],
  ["ised", "ise"],
  ["ized", "ize"],
  ["ting", "t"],
  ["ling", "le"],
  ["ing", ""],
  ["ies", "y"],
  ["ers", ""],
  ["ous", ""],
  ["ive", ""],
  ["ful", ""],
  ["age", ""],
  ["ion", ""],
  ["ed", ""],
  ["ly", ""],
  ["es", ""],
  ["er", ""],
  ["al", ""],
  ["en", ""],
  ["le", ""],
  ["s", ""],
];

/** Minimum remaining length after stripping a suffix. */
const MIN_STEM_LENGTH = 3;

const LATIN_RE = /^[\u0041-\u005A\u0061-\u007A\u00C0-\u024F]+$/;

export function stem(word: string): string {
  // Only stem Latin-script words
  if (!LATIN_RE.test(word)) return word;

  for (const [suffix, replacement] of SUFFIX_RULES) {
    if (word.endsWith(suffix)) {
      const candidate = word.slice(0, -suffix.length) + replacement;
      if (candidate.length >= MIN_STEM_LENGTH) {
        return candidate;
      }
    }
  }

  return word;
}
