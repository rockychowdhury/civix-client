"use client";

import { useServiceRequestDetail } from "@/hooks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { AttachmentGallery } from "./AttachmentGallery";
import { ReclassifyRequestForm } from "@/components/forms/ReclassifyRequestForm";
import { LinkToIssueForm } from "@/components/forms/LinkToIssueForm";
import { FlagInvalidForm } from "@/components/forms/FlagInvalidForm";
import { format } from "date-fns";

interface ServiceRequestDetailSheetProps {
  requestId: string | null;
  onClose: () => void;
}

export function ServiceRequestDetailSheet({ requestId, onClose }: ServiceRequestDetailSheetProps) {
  const { data: request, isLoading } = useServiceRequestDetail(requestId || "");
  
  if (!requestId) return null;

  return (
    <Sheet open={!!requestId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg border-l border-line bg-paper flex flex-col gap-6 overflow-y-auto custom-scrollbar p-6">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-ink/50">Loading details...</div>
        ) : !request ? (
          <div className="flex-1 flex items-center justify-center text-signal-open">Request not found.</div>
        ) : (
          <>
            <SheetHeader className="text-left space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <SheetTitle className="font-display text-2xl text-ink">
                    {request.trackingNumber}
                  </SheetTitle>
                  <p className="text-sm text-ink/60 mt-1">
                    Submitted {format(new Date(request.submittedAt), "PPP 'at' p")}
                  </p>
                </div>
                <StatusPill status={request.status} />
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-medium font-body text-ink/80 text-sm">Citizen Description</h4>
                <div className="p-4 rounded-md bg-field text-ink whitespace-pre-wrap font-body text-sm leading-relaxed border border-line">
                  {request.description}
                </div>
              </div>

              {/* Attachments */}
              {request.attachments && request.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium font-body text-ink/80 text-sm">Attachments</h4>
                  <AttachmentGallery attachments={request.attachments} />
                </div>
              )}

              {/* Location */}
              {request.location && (
                <div className="space-y-2">
                  <h4 className="font-medium font-body text-ink/80 text-sm">Location</h4>
                  <div className="p-4 rounded-md border border-line bg-paper">
                    <p className="font-medium text-ink">{request.location.address}</p>
                    <p className="text-sm text-ink/60">
                      Ward: {request.location.ward} / Zone: {request.location.zone}
                    </p>
                    <div className="mt-3 h-32 bg-field rounded-sm flex items-center justify-center border border-line overflow-hidden">
                      {/* Map Preview Mock */}
                      <div className="w-full h-full bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=15&size=600x300&maptype=roadmap&style=element:geometry%7Ccolor:0xf5f5f5&style=element:labels.icon%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x616161&style=element:labels.text.stroke%7Ccolor:0xf5f5f5&style=feature:administrative.land_parcel%7Celement:labels.text.fill%7Ccolor:0xbdbdbd&style=feature:poi%7Celement:geometry%7Ccolor:0xeeeeee&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:poi.park%7Celement:geometry%7Ccolor:0xe5e5e5&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&style=feature:road%7Celement:geometry%7Ccolor:0xffffff&style=feature:road.arterial%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:road.highway%7Celement:geometry%7Ccolor:0xdadada&style=feature:road.highway%7Celement:labels.text.fill%7Ccolor:0x616161&style=feature:road.local%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&style=feature:transit.line%7Celement:geometry%7Ccolor:0xe5e5e5&style=feature:transit.station%7Celement:geometry%7Ccolor:0xeeeeee&style=feature:water%7Celement:geometry%7Ccolor:0xc9c9c9&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&key=mock')] bg-cover bg-center opacity-60" />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Area */}
              <div className="pt-4 border-t border-line space-y-6">
                <h3 className="font-display text-lg text-ink">Review & Act</h3>

                <ReclassifyRequestForm 
                  requestId={request.id} 
                  currentCategoryId={request.categoryId}
                  onSuccess={onClose} 
                />

                {(!request.linkedIssueId || request.needsReview) && (
                  <LinkToIssueForm 
                    requestId={request.id}
                    categoryId={request.categoryId}
                    ward={request.location?.ward || ""}
                    onSuccess={onClose}
                  />
                )}

                <FlagInvalidForm 
                  requestId={request.id} 
                  onSuccess={onClose} 
                />
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
