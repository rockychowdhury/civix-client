"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Server-driven pagination footer. Hidden when there is a single page. */
export function AdminPagination({
  meta,
  onPageChange,
}: {
  meta?: PageMeta;
  onPageChange: (page: number) => void;
}) {
  if (meta == null || meta.totalPages <= 1) return null;
  return (
    <div className="flex flex-col gap-2 px-1 py-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-body text-xs text-ink/55">
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          className="cursor-pointer"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          className="cursor-pointer"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
