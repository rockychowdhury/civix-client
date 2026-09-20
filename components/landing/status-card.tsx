"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const progress = [
  {
    label: "Submitted",
    state: "completed",
    meta: "Completed 2 hrs ago",
  },
  {
    label: "Routed to Roads Dept.",
    state: "completed",
    meta: "Completed 2 hrs ago",
  },
  {
    label: "Technician Assigned",
    state: "current",
    meta: "In progress — 15 min ago",
  },
  {
    label: "Resolved",
    state: "pending",
    meta: "Estimated 2 days",
  },
] as const;

export function StatusCard({ className }: { className?: string }) {
  const [time, setTime] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setTime(Date.now());
    const initial = setTimeout(update, 0);
    const id = setInterval(update, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  const formattedTime =
    time === null
      ? "------"
      : new Date(time)
          .toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
          .replace(/:/g, "-");

  return (
    <section
      aria-label="Live complaint tracking example"
      className={cn("w-full max-w-[380px] overflow-hidden rounded-xs bg-ink", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5 sm:px-8 sm:py-6">
        <span className="font-mono text-xs font-medium text-signal-resolved">
          CVX-{formattedTime}
        </span>
        <span className="font-body text-xs text-paper/70">Live</span>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          {progress.map((status, i) => (
            <div
              key={status.label}
              className={cn(
                "flex items-center gap-6 py-4",
                i < progress.length - 1 && "border-b border-line",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-2.5 shrink-0 rounded-full border-2",
                  status.state === "completed" && "border-signal-resolved bg-signal-resolved",
                  status.state === "current" &&
                    "animate-dot border-signal-open bg-signal-open shadow-[0_0_0_3px_rgba(181,80,44,0.2)] motion-reduce:animate-none",
                  status.state === "pending" && "border-line bg-transparent",
                )}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-body text-sm leading-tight",
                    status.state === "completed" && "text-signal-resolved",
                    status.state === "current" && "font-medium text-signal-open",
                    status.state === "pending" && "text-paper",
                  )}
                >
                  {status.label}
                </p>
                <p className="mt-0.5 font-mono text-[0.6875rem] text-paper/50">{status.meta}</p>
              </div>
              {status.state === "current" && (
                <span className="rounded-xs bg-signal-open/15 px-2 py-0.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.05em] text-signal-open">
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
