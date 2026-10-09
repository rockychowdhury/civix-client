"use client";

import { format } from "date-fns";
import { Calendar, ExternalLink, MapPin, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { FlagInvalidForm, LinkToIssueForm, ReclassifyRequestForm } from "@/components/form";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGetCityRequestById } from "@/hooks";
import { formatWard, formatZone } from "@/lib/utils";

interface CityRequestDetailSheetProps {
  requestId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CityRequestDetailSheet({
  requestId,
  isOpen,
  onOpenChange,
  onSuccess,
}: CityRequestDetailSheetProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const { data: request, isLoading } = useGetCityRequestById(requestId || "");

  if (!requestId || !isOpen) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl bg-paper border-l border-line p-0 flex flex-col overflow-hidden text-ink">
          {/* Header */}
          <SheetHeader className="p-6 border-b border-line/40 bg-field/30">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-ink">
                    {request?.trackingNumber || "Loading..."}
                  </span>
                  {request?.status && <StatusPill status={request.status} />}
                </div>
                <SheetTitle className="font-display text-xl font-semibold text-ink leading-tight">
                  Citizen Request Dossier
                </SheetTitle>
                <SheetDescription className="text-xs text-ink/60 flex items-center gap-2 font-mono">
                  <Calendar className="size-3 text-ink/40" />
                  {request?.submittedAt
                    ? format(new Date(request.submittedAt), "PPP 'at' p")
                    : "Intake verified"}
                </SheetDescription>
              </div>

              {request?.linkedIssue?.issueNumber && (
                <Link
                  href={`/track?issueNumber=${encodeURIComponent(request.linkedIssue.issueNumber)}`}
                  target="_blank"
                  className="text-xs font-mono text-signal-progress hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  Issue #{request.linkedIssue.issueNumber} <ExternalLink className="size-3" />
                </Link>
              )}
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-sm font-mono text-ink/40 animate-pulse">
                Loading request details...
              </div>
            ) : !request ? (
              <p className="text-sm text-signal-open text-center p-8">Request details not found.</p>
            ) : (
              <>
                {/* Description */}
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-ink/60">
                      Problem Description
                    </h3>
                    {request.category && (
                      <Badge variant="outline" className="text-xs border-line bg-field/30">
                        <Tag className="size-3 mr-1 text-ink/50" />
                        {request.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 rounded-md border border-line bg-field/15 text-sm font-body text-ink whitespace-pre-wrap leading-relaxed">
                    {request.description}
                  </div>
                </section>

                {/* Location */}
                {request.location && (
                  <section className="space-y-2">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-ink/60">
                      Location
                    </h3>
                    <div className="p-3.5 rounded-md border border-line bg-paper flex items-start gap-3 text-xs">
                      <MapPin className="size-4 text-signal-progress shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-ink">{request.location.address}</p>
                        <p className="text-ink/60 mt-0.5 font-mono">
                          {formatWard(request.location.ward)} · {formatZone(request.location.zone)}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Attachments */}
                {request.attachments && request.attachments.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-ink/60">
                      Photos ({request.attachments.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-2.5">
                      {request.attachments.map((att: { id?: string; url: string }, idx: number) => (
                        <button
                          key={att.id || idx}
                          type="button"
                          onClick={() => setSelectedPhoto(att.url)}
                          className="group relative aspect-video rounded-md overflow-hidden border border-line bg-field cursor-pointer focus:outline-none"
                        >
                          <Image
                            src={att.url}
                            alt="Attachment evidence"
                            fill
                            unoptimized
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Triage & Management Actions */}
                <section className="pt-4 border-t border-line space-y-5">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-ink/70">
                    Municipal Intake Actions
                  </h3>

                  <div className="p-4 rounded-lg bg-field/20 border border-line/50 space-y-4">
                    <ReclassifyRequestForm
                      requestId={request.id}
                      currentCategoryId={request.categoryId}
                      onSuccess={() => {
                        toast.success("Request reclassified");
                        if (onSuccess) onSuccess();
                      }}
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
                        onSuccess={() => {
                          toast.success("Request linked to issue");
                          if (onSuccess) onSuccess();
                        }}
                      />
                    )}

                    <FlagInvalidForm
                      requestId={request.id}
                      onSuccess={() => {
                        toast.success("Request flagged");
                        if (onSuccess) onSuccess();
                      }}
                    />
                  </div>
                </section>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Lightbox Dialog */}
      {selectedPhoto && (
        <button
          type="button"
          aria-label="Close photo preview"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer w-full border-none"
          onClick={() => setSelectedPhoto(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-[70vh]">
            <Image
              src={selectedPhoto}
              alt="Enlarged evidence"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        </button>
      )}
    </>
  );
}
