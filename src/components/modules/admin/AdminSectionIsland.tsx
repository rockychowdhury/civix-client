"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/**
 * Dynamic island for admin sections (Static Shell, Dynamic Island).
 * Rendered inside `<Suspense>` on an SSG page; owns all client interactivity.
 * Secondary detail stays collapsed until requested (progressive disclosure).
 */
export function AdminSectionIsland({
  emptyTitle,
  emptyBody,
  primaryLabel,
  onPrimary,
  detail,
  children,
}: {
  emptyTitle: string;
  emptyBody: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  detail?: ReactNode;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {children ?? (
        <EmptyState
          title={emptyTitle}
          body={emptyBody}
          action={
            primaryLabel ? (
              <Button
                type="button"
                onClick={onPrimary}
                className="cursor-pointer bg-ledger text-paper transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {primaryLabel}
              </Button>
            ) : undefined
          }
        />
      )}

      {detail ? (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger
            className={cn(
              "flex cursor-pointer items-center gap-2 font-body text-sm font-medium text-ink/70",
              "transition-colors hover:text-ink focus-visible:outline-2",
            )}
          >
            <ChevronDown
              className={cn("size-4 transition-transform", open && "rotate-180")}
              aria-hidden="true"
            />
            {open ? "Hide details" : "Show details"}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">{detail}</CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  );
}
