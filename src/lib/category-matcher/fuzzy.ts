/**
 * Bounded Levenshtein distance with early termination.
 * Returns the edit distance if ≤ maxEdits, otherwise returns maxEdits + 1.
 */

import { maxEditsForLength } from "./config";

export function boundedLevenshtein(a: string, b: string, maxEdits: number): number {
  const lenA = a.length;
  const lenB = b.length;

  // Quick length-difference check
  if (Math.abs(lenA - lenB) > maxEdits) return maxEdits + 1;

  // Use a single-row DP for space efficiency
  const row = new Array<number>(lenB + 1);

  for (let j = 0; j <= lenB; j++) {
    row[j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    let prev = i;
    let minInRow = prev;
    row[0] = i;

    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(
        row[j] + 1, // deletion
        prev + 1, // insertion
        row[j - 1] + cost, // substitution
      );
      row[j - 1] = prev;
      prev = val;
      if (val < minInRow) minInRow = val;
    }

    row[lenB] = prev;

    // Early termination: if the minimum in this row exceeds maxEdits, bail
    if (minInRow > maxEdits) return maxEdits + 1;
  }

  return row[lenB];
}

/**
 * Find fuzzy matches for a token against a vocabulary.
 * Candidates must share the first letter and have a length difference ≤ maxEdits.
 * Returns matches sorted by edit distance (best first).
 */
export function fuzzyMatch(
  token: string,
  vocabulary: string[],
): { term: string; distance: number }[] {
  const maxEdits = maxEditsForLength(token.length);
  if (maxEdits === 0) return [];

  const firstChar = token[0];
  const results: { term: string; distance: number }[] = [];

  for (const candidate of vocabulary) {
    // Must share first letter
    if (candidate[0] !== firstChar) continue;
    // Length difference filter
    if (Math.abs(candidate.length - token.length) > maxEdits) continue;

    const dist = boundedLevenshtein(token, candidate, maxEdits);
    if (dist <= maxEdits) {
      results.push({ term: candidate, distance: dist });
    }
  }

  // Sort by distance ascending
  results.sort((a, b) => a.distance - b.distance);
  return results;
}
