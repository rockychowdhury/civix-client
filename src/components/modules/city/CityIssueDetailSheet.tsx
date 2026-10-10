"use client";

import { format } from "date-fns";
import { AlertTriangle, Calendar, ExternalLink, MapPin, RefreshCw, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  useCityIssueStatus,
  useCityReopenIssue,
  useGetRequestsByCivicIssue,
  useOverrideIssuePriority,
} from "@/hooks";
import { formatWard, formatZone } from "@/lib/utils";
import type { CivicIssue } from "@/types";

interface CityIssueDetailSheetProps {
  issue: CivicIssue | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PRIORITIES = ["NORMAL", "HIGH", "URGENT", "CRITICAL"];

const STATUS_OPTIONS = [
  "TRIAGED",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_VERIFICATION",
  "RESOLVED",
  "CLOSED",
  "DUPLICATE",
  "REJECTED",
];

export function CityIssueDetailSheet({
  issue,
  isOpen,
  onOpenChange,
  onSuccess,
}: CityIssueDetailSheetProps) {
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("HIGH");
  const [priorityReason, setPriorityReason] = useState("");

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("RESOLVED");
  const [statusNotes, setStatusNotes] = useState("");

  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [_reopenReason, setReopenReason] = useState("");

  const overridePriority = useOverrideIssuePriority();
  const updateStatus = useCityIssueStatus();
  const reopenIssue = useCityReopenIssue();

  const requestsQuery = useGetRequestsByCivicIssue(issue?.id || "");
  const requests = requestsQuery.data?.data || [];

  if (!issue) return null;

  const priorityObj = issue.priority;
  const priority =
    typeof priorityObj === "object"
      ? priorityObj?.code || priorityObj?.name || "Normal"
      : priorityObj || "Normal";
  const normalizedPriority = typeof priority === "string" ? priority.toUpperCase() : "NORMAL";
  const statusUpper = issue.status?.toUpperCase();
  const isReopenable =
    statusUpper === "RESOLVED" ||
    statusUpper === "CLOSED" ||
    statusUpper === "PENDING_VERIFICATION";

  const handlePrioritySubmit = async () => {
    if (!priorityReason.trim()) {
      toast.error("Please provide a reason for priority override");
      return;
    }
    await overridePriority.mutateAsync({
      id: issue.id,
      payload: { priority: selectedPriority, reason: priorityReason.trim() },
    });
    setIsPriorityModalOpen(false);
    setPriorityReason("");
    if (onSuccess) onSuccess();
  };

  const handleStatusSubmit = async () => {
    await updateStatus.mutateAsync({
      id: issue.id,
      payload: { status: selectedStatus, notes: statusNotes.trim() || undefined },
    });
    setIsStatusModalOpen(false);
    setStatusNotes("");
    if (onSuccess) onSuccess();
  };

  const handleReopenSubmit = async () => {
    await reopenIssue.mutateAsync(issue.id);
    setIsReopenModalOpen(false);
    setReopenReason("");
    if (onSuccess) onSuccess();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl bg-paper border-l border-line p-0 flex flex-col overflow-hidden text-ink">
          {/* Header */}
          <SheetHeader className="p-6 border-b border-line/40 bg-field/30">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-semibold text-ink">
                    {issue.issueNumber}
                  </span>
                  <Badge
                    variant={
                      normalizedPriority === "HIGH" ||
                      normalizedPriority === "URGENT" ||
                      normalizedPriority === "CRITICAL"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-[10px] uppercase font-mono tracking-wider"
                  >
                    {priority}
                  </Badge>
                  <StatusPill status={issue.status} />
                </div>
                <SheetTitle className="font-display text-xl font-semibold text-ink leading-tight">
                  {issue.title || "Civic Issue Investigation"}
                </SheetTitle>
                <SheetDescription className="text-xs text-ink/60 flex items-center gap-3">
                  {issue.createdAt && (
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="size-3 text-ink/40" />
                      Created {format(new Date(issue.createdAt), "PPP")}
                    </span>
                  )}
                  {issue.category && (
                    <span className="flex items-center gap-1 font-mono">
                      <Tag className="size-3 text-ink/40" />
                      {issue.category.name}
                    </span>
                  )}
                </SheetDescription>
              </div>

              <Link
                href={`/track?issueNumber=${encodeURIComponent(issue.issueNumber)}`}
                target="_blank"
                className="text-xs font-mono text-signal-progress hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                Tracker <ExternalLink className="size-3" />
              </Link>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Facts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-field/30 border border-line/40 text-xs">
              <div>
                <span className="font-mono text-[10px] text-ink/50 uppercase block">
                  Department
                </span>
                <span className="font-medium text-ink mt-0.5 block truncate">
                  {issue.department?.name || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-ink/50 uppercase block">Location</span>
                <span className="font-medium text-ink mt-0.5 block truncate">
                  {formatWard(issue.location?.ward || issue.ward)}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-ink/50 uppercase block">
                  Citizen Reports
                </span>
                <span className="font-medium text-ink mt-0.5 block">
                  {issue.reportedCount || requests.length || 1} report(s)
                </span>
              </div>
            </div>

            {/* Description */}
            <section className="space-y-2">
              <h3 className="font-display font-medium text-sm text-ink uppercase tracking-wider font-mono">
                Problem Description
              </h3>
              <div className="p-4 rounded-md border border-line bg-field/15 text-sm font-body text-ink/80 whitespace-pre-wrap leading-relaxed">
                {issue.description || "No description provided."}
              </div>
            </section>

            {/* Address & Jurisdiction */}
            {issue.location?.address && (
              <section className="space-y-2">
                <h3 className="font-display font-medium text-sm text-ink uppercase tracking-wider font-mono">
                  Site Location
                </h3>
                <div className="p-3.5 rounded-md border border-line bg-paper flex items-start gap-3">
                  <MapPin className="size-4 text-signal-progress shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium text-ink">{issue.location.address}</p>
                    <p className="text-ink/60 mt-0.5 font-mono">
                      {formatWard(issue.location.ward)} · {formatZone(issue.location.zone)}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Linked Citizen Service Requests */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-medium text-sm text-ink uppercase tracking-wider font-mono">
                  Linked Citizen Reports ({requests.length})
                </h3>
              </div>

              {requestsQuery.isLoading ? (
                <div className="text-xs font-mono text-ink/40 animate-pulse">
                  Loading linked requests...
                </div>
              ) : requests.length === 0 ? (
                <p className="text-xs text-ink/50 italic">No clustered citizen requests found.</p>
              ) : (
                <div className="divide-y divide-line/40 border border-line/40 rounded-lg bg-paper">
                  {requests.map((r) => (
                    <div key={r.id} className="p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-ink">{r.trackingNumber}</span>
                        <StatusPill status={r.status} />
                      </div>
                      <p className="text-ink/70 truncate">{r.description}</p>
                      <p className="text-[10px] text-ink/40 font-mono">
                        {r.submittedAt ? format(new Date(r.submittedAt), "PPP") : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Operational Actions Strip */}
            <section className="pt-4 border-t border-line space-y-3">
              <h3 className="font-display font-medium text-sm text-ink uppercase tracking-wider font-mono">
                Municipal Operations & Oversight
              </h3>
              <div className="flex flex-wrap gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPriorityModalOpen(true)}
                  className="cursor-pointer text-xs"
                >
                  <AlertTriangle className="size-3.5 mr-1.5 text-signal-progress" /> Override
                  Priority
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsStatusModalOpen(true)}
                  className="cursor-pointer text-xs"
                >
                  <RefreshCw className="size-3.5 mr-1.5 text-signal-progress" /> Update Status
                </Button>

                {isReopenable && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsReopenModalOpen(true)}
                    className="cursor-pointer text-xs border-line text-ink hover:bg-field/40"
                  >
                    <RefreshCw className="size-3.5 mr-1.5" /> Reopen Issue
                  </Button>
                )}
              </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      {/* Override Priority Dialog */}
      <Dialog open={isPriorityModalOpen} onOpenChange={setIsPriorityModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-paper border border-line text-ink p-5">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Override Issue Priority</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              Set priority for {issue.issueNumber} and record municipal rationale.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-ink/80">New Priority Level</span>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={selectedPriority === p ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedPriority(p)}
                    className="text-xs font-mono cursor-pointer"
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="priority-reason" className="text-xs font-medium text-ink/80">
                Reason for Override *
              </label>
              <Textarea
                id="priority-reason"
                rows={3}
                placeholder="e.g. Critical road hazard near school, elevating from Normal to Urgent"
                value={priorityReason}
                onChange={(e) => setPriorityReason(e.target.value)}
                className="bg-paper border-line text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPriorityModalOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrioritySubmit}
              disabled={overridePriority.isPending || !priorityReason.trim()}
              className="cursor-pointer"
            >
              {overridePriority.isPending ? "Updating..." : "Save Priority"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-paper border border-line text-ink p-5">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Update Issue Status</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              Transition lifecycle state for {issue.issueNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-ink/80">Target Status</span>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((st) => (
                  <Button
                    key={st}
                    type="button"
                    variant={selectedStatus === st ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedStatus(st)}
                    className="text-xs font-mono justify-start cursor-pointer"
                  >
                    {st.replace(/_/g, " ")}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="status-notes" className="text-xs font-medium text-ink/80">
                Administrative Notes (Optional)
              </label>
              <Textarea
                id="status-notes"
                rows={3}
                placeholder="e.g. Verified by city engineer on site"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="bg-paper border-line text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsStatusModalOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleStatusSubmit}
              disabled={updateStatus.isPending}
              className="cursor-pointer"
            >
              {updateStatus.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reopen Issue Dialog */}
      <Dialog open={isReopenModalOpen} onOpenChange={setIsReopenModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-paper border border-line text-ink p-5">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Reopen Civic Issue</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              Reopening {issue.issueNumber} will return it to active municipal dispatch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs text-ink/70">
              Are you sure you want to reopen this issue? A notification will be sent to the
              assigned department manager.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsReopenModalOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleReopenSubmit}
              disabled={reopenIssue.isPending}
              className="cursor-pointer"
            >
              {reopenIssue.isPending ? "Reopening..." : "Confirm Reopen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
