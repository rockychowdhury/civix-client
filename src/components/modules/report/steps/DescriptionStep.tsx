"use client";

import { CheckCircle2, CircleAlert, Info, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useCategoryMatches } from "@/hooks/useCategoryMatches";
import type { CategoryIndex, MatchResult } from "@/lib/category-matcher";
import { MIN_CHARS } from "@/lib/category-matcher";
import { sanitizeMultilineText } from "@/lib/sanitize";

interface DescriptionStepProps {
  form: any;
  categoryIndex: CategoryIndex | null;
  /** Error message displayed if user tried to proceed with insufficient info. */
  error?: string | null;
  /** Callback to clear the error as soon as user types or changes input. */
  onClearError?: () => void;
  /** Callback to propagate match results up to the wizard. */
  onMatchResult?: (result: MatchResult) => void;
}

/** Rotating placeholder examples for the description textarea. */
const PLACEHOLDER_EXAMPLES = [
  "e.g. Water has been leaking from a pipe near my house since morning",
  "e.g. Large pothole on the main road causing vehicle damage",
  "e.g. Streetlight on Park Avenue has been dark for two weeks",
  "e.g. Overflowing trash bin at the corner of Main St and 5th Ave",
  "e.g. Blocked drain causing flooding on residential street",
];

export function DescriptionStep({
  form,
  categoryIndex,
  error,
  onClearError,
  onMatchResult,
}: DescriptionStepProps) {
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const prevMatchRef = useRef<string | null>(null);

  // Rotate placeholder text every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <form.Field
      name="request.description"
      children={(field: any) => {
        const description = field.state.value || "";
        const charCount = description.length;

        return (
          <DescriptionStepInner
            description={description}
            charCount={charCount}
            error={error}
            onClearError={onClearError}
            field={field}
            categoryIndex={categoryIndex}
            onMatchResult={onMatchResult}
            placeholderIdx={placeholderIdx}
            prevMatchRef={prevMatchRef}
          />
        );
      }}
    />
  );
}

/**
 * Inner component that subscribes to the field value and runs the matcher.
 * Separated to prevent the entire wizard from re-rendering on every keystroke.
 */
function DescriptionStepInner({
  description,
  charCount,
  error,
  onClearError,
  field,
  categoryIndex,
  onMatchResult,
  placeholderIdx,
  prevMatchRef,
}: {
  description: string;
  charCount: number;
  error?: string | null;
  onClearError?: () => void;
  field: any;
  categoryIndex: CategoryIndex | null;
  onMatchResult?: (result: MatchResult) => void;
  placeholderIdx: number;
  prevMatchRef: React.MutableRefObject<string | null>;
}) {
  // Run the matcher (debounced internally)
  const { result, status, showNoMatch } = useCategoryMatches({
    text: description,
    index: categoryIndex,
  });

  // Propagate match results up
  useEffect(() => {
    const key = `${status}-${result.count}`;
    if (prevMatchRef.current !== key) {
      prevMatchRef.current = key;
      onMatchResult?.(result);
    }
  }, [result, status, onMatchResult, prevMatchRef]);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      field.handleChange(sanitizeMultilineText(e.target.value));
      field.handleBlur();
    },
    [field],
  );

  return (
    <div className="space-y-4 animate-slide-up motion-reduce:animate-none">
      {/* Description textarea */}
      <div className="space-y-2">
        <Textarea
          placeholder={PLACEHOLDER_EXAMPLES[placeholderIdx]}
          className="min-h-[160px] resize-y bg-transparent text-base leading-relaxed border-0 shadow-none p-0 focus-visible:ring-0 focus-visible:outline-none focus:ring-0 text-ink placeholder:text-ink/40 transition-colors w-full"
          value={field.state.value || ""}
          onBlur={handleBlur}
          onChange={(e) => {
            field.handleChange(e.target.value);
            if (error) {
              onClearError?.();
            }
          }}
        />

        {/* Error message only shown when user clicked proceed and input was invalid */}
        {error && (
          <p
            className="text-xs sm:text-sm font-medium text-signal-open flex items-center gap-1.5 pt-2 border-t border-line/30 animate-slide-up"
            role="alert"
          >
            <CircleAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>

      {/* Problem match status line — reserved space to prevent layout shifts */}
      <div className="min-h-[36px] flex items-center">
        {categoryIndex && charCount >= MIN_CHARS && (
          <CategoryMatchStatus status={status} count={result.count} showNoMatch={showNoMatch} />
        )}
        {categoryIndex && charCount > 0 && charCount < MIN_CHARS && (
          <div className="flex items-center gap-2 text-xs text-ink/45 font-body">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Add a few more details so we can identify the problem.</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Status indicator for problem matching.
 * Shows match count or no-match guidance message.
 */
function CategoryMatchStatus({
  status,
  count,
  showNoMatch,
}: {
  status: string;
  count: number;
  showNoMatch: boolean;
}) {
  if (status === "matched") {
    const displayCount = Math.min(count, 5);
    return (
      <div className="flex items-center gap-2 text-xs font-body animate-slide-up">
        <CheckCircle2 className="w-3.5 h-3.5 text-signal-resolved shrink-0" />
        <span className="text-ink/60">
          We detected{" "}
          <strong className="text-ink font-medium">
            {displayCount} possible {displayCount === 1 ? "problem" : "problems"}
          </strong>
        </span>
      </div>
    );
  }

  if (status === "no-match" && showNoMatch) {
    return (
      <div className="flex items-center gap-2 text-xs font-body animate-slide-up">
        <XCircle className="w-3.5 h-3.5 text-signal-progress shrink-0" />
        <span className="text-ink/60">
          We couldn't identify the problem yet. Try naming what's broken (e.g. "broken streetlight",
          "pothole").
        </span>
      </div>
    );
  }

  if (status === "insufficient") {
    return null;
  }

  return null;
}
