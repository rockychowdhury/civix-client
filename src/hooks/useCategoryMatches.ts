import { useEffect, useMemo, useRef, useState } from "react";
import type { CategoryIndex, MatchResult, MatchStatus } from "@/lib/category-matcher";
import { DEBOUNCE_MS, matchCategories } from "@/lib/category-matcher";

interface UseCategoryMatchesOptions {
  /** The description text to match against. */
  text: string;
  /** The pre-built category index. */
  index: CategoryIndex | null;
  /** If true, treat all words as finished (e.g., on blur or step transition). */
  allWordsFinished?: boolean;
}

interface UseCategoryMatchesReturn {
  result: MatchResult;
  status: MatchStatus;
  /** Whether we're in the "no match" delay period. */
  showNoMatch: boolean;
}

const EMPTY_RESULT: MatchResult = {
  status: "insufficient",
  matches: [],
  count: 0,
};

/**
 * Debounced hook that matches description text against the category index.
 * Only re-runs when the debounced text changes — the rest of the wizard does not re-render.
 */
export function useCategoryMatches({
  text,
  index,
  allWordsFinished = false,
}: UseCategoryMatchesOptions): UseCategoryMatchesReturn {
  const [debouncedText, setDebouncedText] = useState(text);
  const [showNoMatch, setShowNoMatch] = useState(false);
  const noMatchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  // Compute matches
  const result = useMemo(() => {
    if (!index) return EMPTY_RESULT;
    return matchCategories(debouncedText, index, allWordsFinished);
  }, [debouncedText, index, allWordsFinished]);

  // Handle "no match" delay — don't show the message immediately
  useEffect(() => {
    if (noMatchTimerRef.current) {
      clearTimeout(noMatchTimerRef.current);
      noMatchTimerRef.current = null;
    }

    if (result.status === "no-match") {
      noMatchTimerRef.current = setTimeout(() => {
        setShowNoMatch(true);
      }, 800);
    } else {
      setShowNoMatch(false);
    }

    return () => {
      if (noMatchTimerRef.current) {
        clearTimeout(noMatchTimerRef.current);
      }
    };
  }, [result.status]);

  return {
    result,
    status: result.status,
    showNoMatch,
  };
}
