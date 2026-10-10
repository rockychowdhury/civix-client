"use client";

import { Check, CircleAlert, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { CategoryIndex, RankedMatch } from "@/lib/category-matcher";
import { matchCategories, SEARCH_DEBOUNCE_MS } from "@/lib/category-matcher";
import { cn } from "@/lib/utils";

export type ReportCategory = {
  id: string;
  parentId: string | null;
  name: string;
  description: string | null;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  department?: {
    id?: string;
    name?: string;
    code?: string;
  };
};

interface CategoryStepProps {
  /** All categories from the API. */
  categories: ReportCategory[];
  /** Callback when a category is selected. */
  onSelect: (categoryId: string) => void;
  /** Currently selected category ID. */
  selectedCategoryId?: string;
  /** Error message displayed if user tried to proceed without selecting category. */
  error?: string | null;
  /** Callback to clear error on selection. */
  onClearError?: () => void;
  /** The pre-built category index for matching. */
  categoryIndex: CategoryIndex | null;
  /** The user's description text from Step 1. */
  descriptionText: string;
}

export function CategoryStep({
  categories,
  onSelect,
  selectedCategoryId,
  error,
  onClearError,
  categoryIndex,
  descriptionText,
}: CategoryStepProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSelect = (id: string) => {
    onClearError?.();
    onSelect(id);
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Compute ranked matches from the description
  const rankedMatches = useMemo(() => {
    if (!categoryIndex || !descriptionText.trim()) return [];
    const result = matchCategories(descriptionText, categoryIndex, true);
    return result.matches;
  }, [categoryIndex, descriptionText]);

  // Filter ranked matches by manual search
  const filteredMatches = useMemo(() => {
    if (!debouncedSearch.trim()) return rankedMatches;
    const query = debouncedSearch.toLowerCase();
    return rankedMatches.filter(
      (m) =>
        m.category.name.toLowerCase().includes(query) ||
        m.parentName?.toLowerCase().includes(query) ||
        m.category.description?.toLowerCase().includes(query),
    );
  }, [rankedMatches, debouncedSearch]);

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="space-y-5 animate-slide-up motion-reduce:animate-none">
      {/* Error alert when proceed attempted without selecting a category */}
      {error && (
        <div
          className="flex items-center gap-2.5 p-3.5 rounded-xl bg-signal-open/10 border border-signal-open/30 text-signal-open text-xs sm:text-sm font-medium animate-slide-up"
          role="alert"
        >
          <CircleAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected Category Highlight Banner */}
      {selectedCategoryObj && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-ledger/[0.06] border border-ledger/30 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-6 w-6 rounded-full bg-ledger text-paper flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ledger font-semibold block">
                Selected Problem
              </span>
              <p className="font-display text-sm font-semibold text-ink truncate">
                {selectedCategoryObj.name}
              </p>
            </div>
          </div>
          {selectedCategoryObj.department?.name && (
            <span className="font-mono text-[11px] text-ink/60 shrink-0 hidden sm:inline-block">
              Routed to: {selectedCategoryObj.department.name}
            </span>
          )}
        </div>
      )}

      {/* Search Input Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suggested problems..."
            className="pl-10 pr-9 h-10 bg-paper border-line text-xs sm:text-sm text-ink placeholder:text-ink/40 rounded-xl"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink cursor-pointer p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Suggestion count badge */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink/40 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-ledger" />
            {Math.min(filteredMatches.length, 5)} identified problem types based on your observation
          </span>
        </div>
      </div>

      {/* Ranked matches view — minimal & limited to 5 items */}
      <div className="space-y-2">
        {filteredMatches.slice(0, 5).map((match) => (
          <RankedMatchTile
            key={match.category.id}
            match={match}
            isSelected={selectedCategoryId === match.category.id}
            onSelect={() => handleSelect(match.category.id)}
          />
        ))}

        {filteredMatches.length === 0 && (
          <div className="p-6 text-center rounded-xl border border-line/40 bg-field/20 space-y-2">
            <p className="font-body text-sm text-ink/65">
              No problem types match your search filter.
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="inline-flex items-center gap-1 font-body text-xs text-ledger font-medium hover:underline cursor-pointer"
              >
                Clear search filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Minimal problem match tile: problem name, single department/parent line, clean select action.
 */
function RankedMatchTile({
  match,
  isSelected,
  onSelect,
}: {
  match: RankedMatch;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const subtitle = match.category.department?.name || match.parentName;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer",
        isSelected
          ? "border-ledger bg-ledger/[0.05] ring-1 ring-ledger/30 shadow-xs"
          : "border-line/60 bg-paper hover:border-ink/30 hover:bg-field/20",
      )}
    >
      <div className="space-y-1 pr-4 min-w-0">
        <p className="font-display text-sm sm:text-base font-semibold text-ink truncate">
          {match.category.name}
        </p>

        {subtitle && (
          <p className="font-body text-xs text-ink/55 truncate">
            {match.category.department?.name
              ? `Department: ${match.category.department.name}`
              : match.parentName}
          </p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <div
          className={cn(
            "h-6 w-6 rounded-full border flex items-center justify-center transition-colors",
            isSelected
              ? "border-ledger bg-ledger text-paper"
              : "border-line/70 bg-field/40 text-transparent",
          )}
        >
          <Check className="w-3.5 h-3.5" />
        </div>
      </div>
    </button>
  );
}
