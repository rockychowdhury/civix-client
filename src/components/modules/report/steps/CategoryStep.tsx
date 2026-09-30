"use client";

import { ChevronDown, Search } from "lucide-react";
import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Assuming a category type based on the API response
export type ReportCategory = {
  id: string;
  parentId: string | null;
  name: string;
  description: string | null;
  slug: string;
};

interface CategoryStepProps {
  categories: ReportCategory[];
  onSelect: (categoryId: string) => void;
  selectedCategoryId?: string;
}

export function CategoryStep({ categories, onSelect, selectedCategoryId }: CategoryStepProps) {
  const [search, setSearch] = useState("");
  const [expandedParentId, setExpandedParentId] = useState<string | null>(null);
  const [tileFocusIndex, setTileFocusIndex] = useState(0);

  const tileRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Derive parents and children
  const parents = useMemo(() => categories.filter((c) => !c.parentId), [categories]);

  // Filter based on search
  const filteredParents = useMemo(() => {
    if (!search.trim()) return parents;
    const query = search.toLowerCase();
    return parents.filter((p) => {
      // check if parent matches or any of its children matches
      if (p.name.toLowerCase().includes(query)) return true;
      const children = categories.filter((c) => c.parentId === p.id);
      return children.some((c) => c.name.toLowerCase().includes(query));
    });
  }, [parents, categories, search]);

  const handleParentClick = (parentId: string) => {
    setExpandedParentId((prev) => (prev === parentId ? null : parentId));
  };

  // Arrow-key navigation between parent tiles (roving tabindex)
  const handleTileKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (filteredParents.length === 0) return;

      let nextIndex = index;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextIndex = (index + 1) % filteredParents.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        nextIndex = (index - 1 + filteredParents.length) % filteredParents.length;
      } else if (e.key === "Home") {
        nextIndex = 0;
      } else if (e.key === "End") {
        nextIndex = filteredParents.length - 1;
      } else {
        return;
      }

      e.preventDefault();
      setTileFocusIndex(nextIndex);
      tileRefs.current[filteredParents[nextIndex].id]?.focus();
    },
    [filteredParents],
  );

  // Keep focus index in bounds when the visible set changes
  useEffect(() => {
    setTileFocusIndex((prev) => Math.max(0, Math.min(filteredParents.length - 1, prev)));
  }, [filteredParents.length]);

  return (
    <div className="space-y-6 animate-slide-up motion-reduce:animate-none">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-ink/50" />
        <Input
          placeholder="Search for an issue (e.g., streetlight, pothole)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value.trim() && filteredParents.length === 1) {
              setExpandedParentId(filteredParents[0].id);
            }
          }}
          className="pl-9 h-11"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filteredParents.map((parent, index) => {
          const isExpanded = expandedParentId === parent.id;
          const children = categories.filter(
            (c) =>
              c.parentId === parent.id &&
              (search.trim() === "" || c.name.toLowerCase().includes(search.toLowerCase())),
          );

          return (
            <div key={parent.id} className="flex flex-col gap-2">
              <button
                ref={(node) => {
                  tileRefs.current[parent.id] = node;
                }}
                type="button"
                tabIndex={tileFocusIndex === index ? 0 : -1}
                aria-expanded={isExpanded}
                onClick={() => handleParentClick(parent.id)}
                onKeyDown={(e) => handleTileKeyDown(e, index)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xs border p-5 text-left transition-all hover:border-ink hover:bg-ink/[0.02] focus-visible:outline-signal-open",
                  isExpanded ? "border-ink bg-ink/[0.02]" : "border-line bg-paper",
                  selectedCategoryId &&
                    categories.find((c) => c.id === selectedCategoryId)?.parentId === parent.id
                    ? "ring-1 ring-ledger border-ledger"
                    : "",
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-display text-xl font-medium text-ink">{parent.name}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200",
                      isExpanded && "rotate-180",
                    )}
                  />
                </span>
                {parent.description && (
                  <span className="font-body text-sm text-ink/60 line-clamp-1">
                    {parent.description}
                  </span>
                )}
              </button>

              {isExpanded && (
                <div className="ml-2 mt-1 flex flex-col gap-2 border-l-2 border-line pl-4 animate-slide-up motion-reduce:animate-none">
                  {children.length > 0 ? (
                    children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        tabIndex={0}
                        onClick={() => onSelect(child.id)}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-xs p-3 text-left transition-colors hover:bg-line/50 focus-visible:outline-signal-open",
                          selectedCategoryId === child.id
                            ? "bg-ledger/[0.08] text-ledger font-medium"
                            : "text-ink/80",
                        )}
                      >
                        {child.name}
                        {selectedCategoryId === child.id && (
                          <span className="text-ledger text-xl leading-none">✓</span>
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-ink/50 p-2">No specific subcategories found.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filteredParents.length === 0 && (
          <div className="col-span-full py-8 text-center text-ink/60">
            No categories found matching "{search}".
          </div>
        )}
      </div>
    </div>
  );
}
