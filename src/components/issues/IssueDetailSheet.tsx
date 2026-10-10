"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  ExternalLink,
  FileText,
  History,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCivicIssueById } from "@/hooks/issue.hook";
import { useCreateWorkOrder } from "@/hooks/work-order.hook";

interface IssueDetailSheetProps {
  issueId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IssueDetailSheet({ issueId, isOpen, onOpenChange }: IssueDetailSheetProps) {
  const { data: issue, isLoading } = useCivicIssueById(isOpen ? issueId : undefined);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Work order creation dialog state
  const [isWorkOrderOpen, setIsWorkOrderOpen] = useState(false);
  const [workOrderTitle, setWorkOrderTitle] = useState("");
  const [workOrderDescription, setWorkOrderDescription] = useState("");
  const createWorkOrder = useCreateWorkOrder();

  const handleOpenCreateWorkOrder = () => {
    if (issue) {
      setWorkOrderTitle(
        `${issue.category?.name || "Issue"} - Action Required (${issue.issueNumber})`,
      );
      setWorkOrderDescription(
        `Location: ${issue.location?.address || "On-site"}\n\nInstructions:\nStandard operating procedure applies. Assess the situation and report updates.`,
      );
    }
    setIsWorkOrderOpen(true);
  };

  const handleConfirmCreateWorkOrder = () => {
    if (!issueId || !workOrderTitle) return;

    createWorkOrder.mutate(
      {
        civicIssueId: issueId,
        title: workOrderTitle,
        description: workOrderDescription,
      },
      {
        onSuccess: () => {
          toast.success("Work order created successfully");
          setIsWorkOrderOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.data?.message || "Failed to create work order");
        },
      },
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl bg-paper border-l border-line p-0 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-ink/40">
              <Loader2 className="h-8 w-8 animate-spin text-ledger" />
              <span className="text-xs font-mono">Loading issue dossier...</span>
            </div>
          ) : issue ? (
            <>
              {/* Header */}
              <SheetHeader className="p-6 border-b border-line/40 bg-field/30">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-xs text-ink/80 bg-paper">
                      #{issue.issueNumber}
                    </Badge>
                    <Badge
                      variant="default"
                      className="bg-ledger text-paper text-[10px] uppercase tracking-wider"
                    >
                      {issue.status?.replace(/_/g, " ")}
                    </Badge>
                    {issue.priority && (
                      <Badge
                        variant="secondary"
                        className="bg-paper border border-line/60 text-ink/80 text-[10px] uppercase"
                      >
                        {typeof issue.priority === "object"
                          ? issue.priority.name || issue.priority.code
                          : issue.priority}
                      </Badge>
                    )}
                    {issue.category && (
                      <span className="text-xs font-mono text-ink/60 bg-ink/5 px-2 py-0.5 rounded-xs">
                        {issue.category.name}
                      </span>
                    )}
                  </div>

                  <SheetTitle className="font-display text-xl text-ink leading-tight pt-1">
                    {issue.title}
                  </SheetTitle>

                  <div className="flex items-center gap-4 text-xs text-ink/60 flex-wrap pt-1">
                    {issue.location?.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-ink/40 shrink-0" />
                        {issue.location.address}
                        {issue.location.landmark ? ` (${issue.location.landmark})` : ""}
                      </span>
                    )}
                    {issue.ward && (
                      <span className="font-mono text-[11px] bg-field/80 px-1.5 py-0.5 rounded-xs">
                        {typeof issue.ward === "string" ? issue.ward : issue.ward.name}
                      </span>
                    )}
                  </div>
                </div>
              </SheetHeader>

              {/* Scrollable Dossier Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-7">
                {/* Description & Overview */}
                <section className="space-y-3">
                  <h3 className="font-display font-medium text-base text-ink">
                    Incident Description
                  </h3>
                  <div className="bg-field/20 border border-line/30 rounded-md p-4 text-xs text-ink/80 whitespace-pre-wrap font-body leading-relaxed">
                    {issue.description || "No detailed description provided."}
                  </div>

                  {/* Summary Metrics Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-md bg-paper border border-line/40 space-y-0.5">
                      <span className="text-[10px] font-mono uppercase text-ink/50">
                        Citizen Reports
                      </span>
                      <p className="font-display text-lg font-semibold text-ink">
                        {issue.reportedCount ?? 1}
                      </p>
                      <span className="text-[10px] font-mono text-ink/40">combined</span>
                    </div>

                    <div className="p-3 rounded-md bg-paper border border-line/40 space-y-0.5">
                      <span className="text-[10px] font-mono uppercase text-ink/50">
                        First Reported
                      </span>
                      <p className="font-display text-xs font-medium text-ink truncate">
                        {issue.firstReportedAt
                          ? format(new Date(issue.firstReportedAt), "MMM d, yyyy")
                          : "N/A"}
                      </p>
                      <span className="text-[10px] font-mono text-ink/40">
                        {issue.firstReportedAt
                          ? formatDistanceToNow(new Date(issue.firstReportedAt), {
                              addSuffix: true,
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="p-3 rounded-md bg-paper border border-line/40 space-y-0.5 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-mono uppercase text-ink/50">
                        Department
                      </span>
                      <p className="font-display text-xs font-medium text-ink truncate">
                        {issue.department?.name || "General"}
                      </p>
                      <span className="text-[10px] font-mono text-ledger font-semibold">
                        {issue.department?.code || ""}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Linked Service Requests & Citizen Evidence */}
                {issue.serviceRequests && issue.serviceRequests.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-medium text-base text-ink">
                        Citizen Reports & Evidence ({issue.serviceRequests.length})
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {issue.serviceRequests.map((req: any) => (
                        <div
                          key={req.id}
                          className="rounded-lg border border-line/50 bg-paper p-4 space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-semibold text-ink bg-field px-2 py-0.5 rounded-xs border border-line/40">
                              {req.trackingNumber}
                            </span>
                            <span className="text-ink/50 font-mono text-[11px]">
                              {req.submittedAt
                                ? format(new Date(req.submittedAt), "MMM d, yyyy · h:mm a")
                                : ""}
                            </span>
                          </div>

                          {req.description && (
                            <p className="text-xs text-ink/80 font-body leading-relaxed bg-field/15 p-2.5 rounded-sm">
                              {req.description}
                            </p>
                          )}

                          {/* Request Evidence Attachments */}
                          {req.attachments && req.attachments.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-ink/50 block mb-2">
                                Photo / Document Evidence ({req.attachments.length})
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {req.attachments.map((att: any) => {
                                  const isImg =
                                    att.fileType === "IMAGE" ||
                                    att.url?.match(/\.(jpeg|jpg|png|webp|gif)/i);

                                  return (
                                    <div
                                      key={att.id}
                                      className="group relative rounded-md border border-line/40 bg-field/20 overflow-hidden hover:border-line transition-all"
                                    >
                                      {isImg ? (
                                        <button
                                          type="button"
                                          className="aspect-video relative cursor-pointer overflow-hidden bg-ink/5 w-full block text-left"
                                          onClick={() => setSelectedPhoto(att.url)}
                                        >
                                          <img
                                            src={att.url}
                                            alt={att.fileName || "Evidence attachment"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                          />
                                          <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-paper">
                                            <ImageIcon className="size-4" />
                                          </div>
                                        </button>
                                      ) : (
                                        <a
                                          href={att.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="p-3 flex flex-col justify-between h-20 text-xs hover:bg-field/40 transition-colors"
                                        >
                                          <div className="flex items-center gap-1.5 text-ledger font-medium">
                                            <FileText className="size-4 shrink-0" />
                                            <span className="truncate">{att.fileName}</span>
                                          </div>
                                          <span className="text-[10px] font-mono text-ink/40">
                                            {formatFileSize(att.fileSize)}
                                          </span>
                                        </a>
                                      )}

                                      {isImg && (
                                        <div className="p-1.5 text-[10px] font-mono text-ink/60 truncate bg-paper border-t border-line/20">
                                          {att.fileName || "Evidence photo"}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Work Orders Dispatched for this Issue */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-medium text-base text-ink">
                      Dispatched Work Orders
                    </h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleOpenCreateWorkOrder}
                      className="cursor-pointer text-xs h-7 px-2.5 bg-paper border border-line/40 text-ink"
                    >
                      <Plus className="size-3.5 mr-1 text-ledger" /> New Work Order
                    </Button>
                  </div>

                  {issue.workOrders && issue.workOrders.length > 0 ? (
                    <div className="divide-y divide-line/40 rounded-lg border border-line/40 bg-paper overflow-hidden">
                      {issue.workOrders.map((wo: any) => (
                        <div
                          key={wo.id}
                          className="p-3.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-ink">
                                WO-{wo.id.slice(0, 8).toUpperCase()}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-mono border-line/40"
                              >
                                {wo.status?.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <p className="text-ink/80 font-medium truncate max-w-sm">{wo.title}</p>
                          </div>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2 text-ledger hover:text-ledger hover:bg-ledger/10 cursor-pointer"
                          >
                            <Link href="/department/work-orders">
                              View <ArrowRight className="size-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-line/30 bg-field/15 p-5 text-center space-y-2">
                      <Wrench className="size-6 text-ink/30 mx-auto" />
                      <p className="font-display text-sm font-medium text-ink">
                        No Work Orders Created Yet
                      </p>
                      <p className="font-body text-xs text-ink/50 max-w-xs mx-auto">
                        This issue is pending crew dispatch. You can create a work order to assign a
                        technician.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleOpenCreateWorkOrder}
                        className="cursor-pointer text-xs h-7.5 px-3 bg-ledger text-paper hover:bg-ledger/90 mt-1"
                      >
                        <Plus className="size-3.5 mr-1" /> Create Work Order
                      </Button>
                    </div>
                  )}
                </section>

                {/* Status Transition History (Audit Trail) */}
                {issue.statusHistory && issue.statusHistory.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <History className="size-4 text-ink/50" />
                      <h3 className="font-display font-medium text-base text-ink">
                        Status History & Audit Ledger
                      </h3>
                    </div>

                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-line/60">
                      {issue.statusHistory.map((item: any) => (
                        <div key={item.id} className="relative space-y-1">
                          {/* Timeline dot */}
                          <div className="absolute -left-6 top-1 size-2.5 rounded-full bg-ledger border-2 border-paper ring-2 ring-line/30" />

                          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              {item.previousStatus && (
                                <>
                                  <span className="text-ink/50 line-through">
                                    {item.previousStatus}
                                  </span>
                                  <span className="text-ink/40">→</span>
                                </>
                              )}
                              <span className="font-semibold text-ledger font-mono">
                                {item.newStatus}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono text-ink/40">
                              {item.createdAt
                                ? format(new Date(item.createdAt), "MMM d, yyyy · h:mm a")
                                : ""}
                            </span>
                          </div>

                          <div className="text-xs text-ink/70 font-body">
                            {item.changedBy ? (
                              <span className="font-medium text-ink">
                                {item.changedBy.displayName || item.changedBy.email}
                              </span>
                            ) : (
                              <span className="text-ink/40 italic">System automated</span>
                            )}
                            {item.notes && <p className="mt-0.5 text-ink/60">{item.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span className="text-ink/40 text-4xl font-display">!</span>
              <p className="text-ink/60 text-sm">Issue record not found.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Photo Lightbox Dialog */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
          <DialogContent className="max-w-3xl p-2 bg-paper border border-line">
            <div className="relative aspect-auto max-h-[80vh] flex items-center justify-center overflow-hidden rounded-md bg-ink/5">
              <img
                src={selectedPhoto}
                alt="Enlarged evidence document"
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <DialogFooter className="px-3 pb-2 pt-1 flex justify-between sm:justify-between items-center w-full">
              <a
                href={selectedPhoto}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-ledger hover:underline flex items-center gap-1"
              >
                Open Original in New Tab <ExternalLink className="size-3" />
              </a>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPhoto(null)}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Work Order Modal */}
      <Dialog open={isWorkOrderOpen} onOpenChange={setIsWorkOrderOpen}>
        <DialogContent className="max-w-md bg-paper border border-line">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-ink">
              Create Work Order for #{issue?.issueNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="wo-title-input" className="text-xs font-medium text-ink">
                Work Order Title
              </label>
              <Input
                id="wo-title-input"
                value={workOrderTitle}
                onChange={(e) => setWorkOrderTitle(e.target.value)}
                placeholder="e.g. Water Leakage - Repair Pipe"
                className="h-8 text-xs bg-paper border-line/40 font-body"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="wo-description-input" className="text-xs font-medium text-ink">
                Instructions & Notes
              </label>
              <Textarea
                id="wo-description-input"
                value={workOrderDescription}
                onChange={(e) => setWorkOrderDescription(e.target.value)}
                rows={4}
                placeholder="Specific instructions for technician/crew..."
                className="text-xs bg-paper border-line/40 font-body"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsWorkOrderOpen(false)}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmCreateWorkOrder}
              disabled={createWorkOrder.isPending || !workOrderTitle}
              className="cursor-pointer text-xs bg-ledger text-paper hover:bg-ledger/90"
            >
              {createWorkOrder.isPending ? "Creating..." : "Create Work Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
