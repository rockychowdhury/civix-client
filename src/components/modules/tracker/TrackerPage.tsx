"use client";

import { Loader2, MoveLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IssueSearchForm } from "@/components/form/issue-search-form";
import { Button } from "@/components/ui/button";
import { useCivicIssueTracking } from "@/hooks/issue.hook";
import { CurrentStatusPanel } from "./CurrentStatusPanel";
import { StatusHistoryLedger } from "./StatusHistoryLedger";

export function TrackerPage() {
  const searchParams = useSearchParams();
  const issueNumber = searchParams.get("issueNumber") || "";
  const { data, isLoading, isError, error } = useCivicIssueTracking(issueNumber);

  // Empty state: No issue number provided yet
  if (!issueNumber) {
    return (
      <div className="relative flex h-dvh w-full items-center justify-center p-6 bg-paper">
        <div className="absolute left-6 top-6 sm:left-8 sm:top-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-body text-sm font-medium text-ink/60 hover:text-ink transition-colors"
          >
            <MoveLeft size={16} />
            Back to Home
          </Link>
        </div>
        <div className="w-full max-w-md space-y-8">
          <header className="text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Track an issue
            </h1>
            <p className="mt-3 font-body text-sm text-ink/70">
              Enter your issue tracking number below to see its current status.
            </p>
          </header>
          <IssueSearchForm key="empty-search" />
        </div>
      </div>
    );
  }

  // Error/Not found state
  if (isError) {
    const isNotFound =
      (error as any)?.response?.status === 404 || (error as any)?.statusCode === 404;
    return (
      <div className="relative flex h-dvh w-full flex-col items-center justify-center p-6 text-center bg-paper">
        <div className="absolute left-6 top-6 sm:left-8 sm:top-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-body text-sm font-medium text-ink/60 hover:text-ink transition-colors"
          >
            <MoveLeft size={16} />
            Back to Home
          </Link>
        </div>
        <div className="w-full max-w-md space-y-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {isNotFound ? "We couldn't find that issue number" : "Something went wrong"}
          </h1>
          <p className="font-body text-ink/70">
            {isNotFound
              ? "Please check the tracking number (e.g. ISS-260923-0001) and try again."
              : "We couldn't load the issue data right now. Please try again later."}
          </p>
          <IssueSearchForm key={`error-search-${issueNumber}`} defaultIssueNumber={issueNumber} />
          <div className="pt-4">
            <Button variant="secondary" asChild>
              <Link href="/track">Clear search</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-paper">
        <Loader2 className="animate-spin text-ink/40" size={32} />
      </div>
    );
  }

  // Success state with data
  if (data) {
    return (
      <div className="relative flex min-h-dvh w-full flex-col bg-paper lg:h-dvh lg:flex-row">
        {/* Left pane: Fixed, 40% width on desktop */}
        <div className="flex shrink-0 flex-col bg-paper p-6 sm:p-8 lg:w-2/5 lg:border-r lg:border-ink/10 lg:items-end">
          <div className="relative w-full pt-16 sm:pt-20 lg:pt-28 lg:max-w-md xl:max-w-lg lg:pr-8 xl:pr-12">
            {/* Navigation Action Links (Absolute positioned to detach from column alignment but align with text) */}
            <div className="absolute left-0 top-0 flex flex-wrap items-center gap-4 z-20">
              <Link
                href="/"
                className="flex items-center gap-1.5 font-body text-xs font-medium text-ink/50 hover:text-ink transition-colors cursor-pointer"
              >
                <MoveLeft size={14} />
                Home
              </Link>
              <div className="h-3 w-px bg-ink/20" />
              <Link
                href="/track"
                className="font-body text-xs font-medium text-ink/50 hover:text-ink transition-colors cursor-pointer"
              >
                Track another issue
              </Link>
            </div>

            <CurrentStatusPanel issue={data} />
          </div>
        </div>

        {/* Right pane: Scrollable, 60% width on desktop */}
        <div className="flex-1 overflow-visible bg-paper/50 p-6 pt-2 sm:p-8 sm:pt-4 lg:overflow-hidden lg:pt-8 flex justify-start">
          <div className="w-full pt-8 sm:pt-12 lg:h-full lg:overflow-y-auto lg:pt-20 lg:max-w-3xl lg:pl-8 xl:pl-12">
            <StatusHistoryLedger history={data.statusHistory} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
