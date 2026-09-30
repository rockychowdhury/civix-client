"use client";

import type * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrackReportForm } from "./track-report-form";

export function TrackReportDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track a report</DialogTitle>
          <DialogDescription>
            Enter the tracking number from your confirmation. We keep the full timeline public —
            every assignment, deadline, and resolution.
          </DialogDescription>
        </DialogHeader>
        <TrackReportForm id="tracking-number-dialog" autoFocus />
      </DialogContent>
    </Dialog>
  );
}
