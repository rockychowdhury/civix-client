"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";

export function TrackReportForm({
  className,
  id = "tracking-number",
  autoFocus = false,
}: {
  className?: string;
  id?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = React.useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trackingNumber = value.trim();
    if (!trackingNumber) {
      toast.error("Enter a tracking number", {
        description: "Tracking numbers look like ISS-260923-0001.",
      });
      return;
    }

    const params = new URLSearchParams({ issueNumber: trackingNumber });
    router.push(`/track?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex items-end gap-3", className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <label htmlFor={id} className="sr-only">
          Tracking number
        </label>
        <Input
          id={id}
          name="trackingNumber"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Enter your tracking number"
          autoComplete="off"
          autoFocus={autoFocus}
          spellCheck={false}
          className="h-9 font-mono text-sm"
        />
      </div>
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        className="shrink-0 py-2"
      >
        Track
      </Button>
    </form>
  );
}
