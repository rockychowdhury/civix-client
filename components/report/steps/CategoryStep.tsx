"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
        {filteredParents.map((parent) => {
          const isExpanded = expandedParentId === parent.id;
          const children = categories.filter(
            (c) =>
              c.parentId === parent.id &&
              (search.trim() === "" || c.name.toLowerCase().includes(search.toLowerCase())),
          );

          // If searching, and this parent doesn't match directly but children do, expand automatically
          // (In a fuller implementation, this could be more sophisticated)

          return (
            <div key={parent.id} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleParentClick(parent.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-5 text-left transition-all hover:border-ink hover:bg-ink/[0.02]",
                  isExpanded ? "border-ink bg-ink/[0.02]" : "border-line bg-paper",
                  selectedCategoryId &&
                    categories.find((c) => c.id === selectedCategoryId)?.parentId === parent.id
                    ? "ring-1 ring-ledger border-ledger"
                    : "",
                )}
              >
                <span className="font-display text-lg font-medium text-ink">{parent.name}</span>
                {parent.description && (
                  <span className="font-body text-sm text-ink/60 line-clamp-1">
                    {parent.description}
                  </span>
                )}
              </button>

              {isExpanded && (
                <div className="ml-4 mt-2 flex flex-col gap-2 border-l-2 border-line pl-4 animate-in slide-in-from-top-2">
                  {children.length > 0 ? (
                    children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => onSelect(child.id)}
                        className={cn(
                          "flex items-center justify-between rounded-md p-3 text-left transition-colors hover:bg-line/50",
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
