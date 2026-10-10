"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  Tag,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { FlagInvalidForm, LinkToIssueForm, ReclassifyRequestForm } from "@/components/form";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useServiceRequestDetail } from "@/hooks";
import { formatWard, formatZone } from "@/lib/utils";
import { AttachmentGallery } from "./AttachmentGallery";

interface ServiceRequestDetailSheetProps {
  requestId: string | null;
  onClose: () => void;
}

export function ServiceRequestDetailSheet({ requestId, onClose }: ServiceRequestDetailSheetProps) {
  const { data: request, isLoading } = useServiceRequestDetail(requestId || "");

  if (!requestId) return null;

  const citizen = request?.citizen;
  const citizenName =
    citizen?.name ||
    citizen?.user?.name ||
    (citizen?.user?.email ? citizen.user.email.split("@")[0] : null);
  const email = citizen?.user?.email;
  const phone = citizen?.phone || citizen?.user?.phone;
  const trustScore = citizen?.trustScore ?? citizen?.trustLevel;

  const civicIssue = request?.civicIssue;
  const latestWo = civicIssue?.workOrders?.[0];

  return (
    <Sheet open={!!requestId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg border-l border-line bg-paper flex flex-col gap-6 overflow-y-auto custom-scrollbar p-6">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
            <div className="size-7 rounded-full border-2 border-ledger border-t-transparent animate-spin mb-3" />
            <span className="text-xs">Loading report details...</span>
          </div>
        ) : !request ? (
          <div className="flex-1 flex items-center justify-center text-signal-open text-sm font-body">
            Report not found.
          </div>
        ) : (
          <>
            <SheetHeader className="text-left space-y-4 pb-2 border-b border-line/30">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="font-display text-2xl text-ink">
                      {request.trackingNumber}
                    </SheetTitle>
                    {request.category?.name && (
                      <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                        {request.category.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-ink/60">
                    Submitted {format(new Date(request.submittedAt), "PPP 'at' p")}
                  </p>
                </div>
                <StatusPill status={request.status} />
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Citizen Identity */}
              {(citizenName || email || phone) && (
                <div className="p-3.5 rounded-lg border border-line/40 bg-field/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-medium text-ink flex items-center gap-1.5">
                      <User className="size-3.5 text-ledger" />
                      Citizen Reporter
                    </span>
                    {trustScore !== undefined && trustScore !== null && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-mono bg-paper border-line/40 text-ledger"
                      >
                        <ShieldCheck className="size-3 mr-1 text-signal-resolved" />
                        Trust Score {trustScore}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-ink/80 font-body">
                    <p className="font-medium">{citizenName || "Verified Citizen"}</p>
                    <div className="flex items-center gap-3 text-ink/50 text-[11px] mt-0.5 flex-wrap">
                      {email && <span>{email}</span>}
                      {phone && <span>{phone}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-medium font-body text-ink/80 text-xs uppercase tracking-wider">
                  Citizen Description
                </h4>
                <div className="p-4 rounded-md bg-field/30 text-ink/90 whitespace-pre-wrap font-body text-xs leading-relaxed border border-line/40">
                  {request.description}
                </div>
              </div>

              {/* Attachments */}
              {request.attachments && request.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium font-body text-ink/80 text-xs uppercase tracking-wider">
                    Evidence Attachments ({request.attachments.length})
                  </h4>
                  <AttachmentGallery attachments={request.attachments} />
                </div>
              )}

              {/* Location */}
              {request.location && (
                <div className="space-y-2">
                  <h4 className="font-medium font-body text-ink/80 text-xs uppercase tracking-wider">
                    Incident Location
                  </h4>
                  <div className="p-3.5 rounded-md border border-line/40 bg-paper space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 text-ledger shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-ink">{request.location.address}</p>
                        {request.location.landmark && (
                          <p className="text-ink/60 text-[11px] mt-0.5">
                            Landmark: {request.location.landmark}
                          </p>
                        )}
                        <p className="text-ink/50 text-[11px] mt-0.5 font-mono">
                          {formatWard(request.location.ward)} • {formatZone(request.location.zone)}
                          {request.location.postalCode ? ` (${request.location.postalCode})` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Linked Civic Issue & Work Order Context */}
              {civicIssue && (
                <div className="p-3.5 rounded-lg border border-line/40 bg-field/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-medium text-ink flex items-center gap-1.5">
                      <Tag className="size-3.5 text-ledger" />
                      Linked Civic Issue
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {civicIssue.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <Link
                      href={`/department/issues?searchTerm=${civicIssue.issueNumber}`}
                      className="font-mono font-medium text-ledger hover:underline flex items-center gap-1"
                    >
                      #{civicIssue.issueNumber}
                      <ExternalLink className="size-2.5 opacity-60" />
                    </Link>

                    {latestWo?.currentAssignee?.name ? (
                      <span className="text-ink/70 flex items-center gap-1 text-[11px]">
                        <Wrench className="size-3 text-ledger" />
                        {latestWo.currentAssignee.name}
                      </span>
                    ) : (
                      <span className="text-ink/40 text-[11px] italic">No Crew Assigned</span>
                    )}
                  </div>
                </div>
              )}

              {/* Citizen Post-Resolution Feedback */}
              {request.feedback && (
                <div className="p-3.5 rounded-lg border border-line/40 bg-field/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-medium text-ink flex items-center gap-1.5">
                      <MessageSquare className="size-3.5 text-ledger" />
                      Citizen Feedback
                    </span>
                    <div className="flex items-center text-amber-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3 ${
                            i < (request.feedback?.rating ?? 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-ink/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {request.feedback.comment && (
                    <p className="text-xs text-ink/80 italic font-body">
                      "{request.feedback.comment}"
                    </p>
                  )}
                  {request.feedback.createdAt && (
                    <p className="text-[10px] text-ink/40 font-mono">
                      Received{" "}
                      {formatDistanceToNow(new Date(request.feedback.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Action Area */}
              <div className="pt-4 border-t border-line/40 space-y-6">
                <h3 className="font-display text-base font-semibold text-ink">Review & Actions</h3>

                <ReclassifyRequestForm
                  requestId={request.id}
                  currentCategoryId={request.categoryId}
                  onSuccess={onClose}
                />

                {(!request.linkedIssueId || request.needsReview) && (
                  <LinkToIssueForm
                    requestId={request.id}
                    categoryId={request.categoryId}
                    ward={
                      typeof request.location?.ward === "object"
                        ? String(
                            (request.location.ward as any)?.number ??
                              (request.location.ward as any)?.name ??
                              "",
                          )
                        : String(request.location?.ward || "")
                    }
                    onSuccess={onClose}
                  />
                )}

                <FlagInvalidForm requestId={request.id} onSuccess={onClose} />
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
