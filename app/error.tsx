"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Civix Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="flex max-w-[480px] flex-col items-start gap-6">
        {/* Error indicator */}
        <div className="flex items-center gap-3">
          <span className="inline-flex size-2.5 rounded-full bg-signal-open" />
          <span className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-signal-open">
            System Error
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-display text-[clamp(1.5rem,4vw,2.25rem)] leading-tight text-ink">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="font-body text-[0.9375rem] leading-relaxed text-ink/60">
          We hit an unexpected problem. This has been logged and our team will
          look into it. You can try again, or head back to the homepage.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button onClick={reset} variant="primary" size="sm">
            Try again
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="/">Go to homepage</a>
          </Button>
        </div>

        {/* Digest (if available, for support) */}
        {error.digest && (
          <p className="font-mono text-[0.6875rem] text-ink/30">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
