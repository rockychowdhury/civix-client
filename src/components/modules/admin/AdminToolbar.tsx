"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";

/**
 * List toolbar: one search field (the focal interaction) plus an optional
 * primary action slot. Parents own the value and debounce it.
 */
export function AdminToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  resultCount,
  action,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  resultCount?: number;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/40"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="bg-field/50 pl-9"
        />
      </div>
      <div className="flex items-center gap-3">
        {resultCount != null ? (
          <p className="font-mono text-xs text-ink/50" aria-live="polite">
            {resultCount} {resultCount === 1 ? "record" : "records"}
          </p>
        ) : null}
        {action}
      </div>
    </div>
  );
}
