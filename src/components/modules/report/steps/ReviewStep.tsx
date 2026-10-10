"use client";

import {
  CheckCircle2,
  Clock,
  Edit2,
  FileText,
  Image as ImageIcon,
  MapPin,
  ShieldCheck,
  Tag,
} from "lucide-react";
import Image from "next/image";
import type { ReportCategory } from "./CategoryStep";

interface ReviewStepProps {
  form: any;
  selectedCategory?: ReportCategory;
  files: File[];
  onEditStep: (stepIndex: number) => void;
}

export function ReviewStep({ form, selectedCategory, files, onEditStep }: ReviewStepProps) {
  return (
    <form.Subscribe
      selector={(state: any) => state.values}
      children={(data: any) => {
        const address = data.location?.address;
        const landmark = data.location?.landmark;
        const postalCode = data.location?.postalCode;
        const lat = data.location?.latitude;
        const lng = data.location?.longitude;
        const hasCoords = lat != null && lng != null;

        return (
          <div className="space-y-6 animate-slide-up motion-reduce:animate-none">
            <div className="flex items-center gap-2.5 p-3 rounded-lg border border-ledger/30 bg-ledger/[0.04] text-xs font-mono text-ledger">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>
                Ready for dispatch. Please review details before transmitting to city services.
              </span>
            </div>

            <div className="rounded-xl border border-line/60 bg-paper overflow-hidden shadow-xs">
              <div className="bg-field/30 border-b border-line/40 px-5 py-3.5 flex flex-wrap items-center gap-x-3 gap-y-2 justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="font-display text-sm font-semibold text-ink">
                    Report Dispatch Manifest
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-paper border border-line/40 text-ink/60 shrink-0">
                    Draft Verified
                  </span>
                </div>
                {selectedCategory?.department?.name && (
                  <span className="font-mono text-xs text-ledger font-medium truncate max-w-full">
                    → {selectedCategory.department.name}
                  </span>
                )}
              </div>

              <div className="divide-y divide-line/40 font-body text-sm">
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/45">
                      <FileText className="w-3 h-3 text-ledger" />
                      <span>Citizen Observation</span>
                    </div>
                    <div className="p-3 rounded-lg border border-line/40 bg-field/20 text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-wrap">
                      {data.request?.description || "No description entered"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditStep(0)}
                    className="flex items-center gap-1 text-xs text-ledger hover:underline underline-offset-4 cursor-pointer shrink-0 font-medium"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/45">
                      <Tag className="w-3 h-3 text-ledger" />
                      <span>Confirmed Problem</span>
                    </div>
                    <p className="font-display text-base font-semibold text-ink">
                      {selectedCategory?.name || "No Category Selected"}
                    </p>
                    {selectedCategory?.description && (
                      <p className="font-body text-xs text-ink/60 max-w-lg">
                        {selectedCategory.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditStep(1)}
                    className="flex items-center gap-1 text-xs text-ledger hover:underline underline-offset-4 cursor-pointer shrink-0 font-medium"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/45">
                      <MapPin className="w-3 h-3 text-ledger" />
                      <span>Physical Location</span>
                    </div>
                    <p className="font-medium text-ink">{address || "Address not specified"}</p>
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {landmark && (
                        <span className="font-mono text-xs text-ink/65 bg-field/40 px-2 py-0.5 rounded border border-line/30">
                          Landmark: {landmark}
                        </span>
                      )}
                      {postalCode && (
                        <span className="font-mono text-xs text-ink/65 bg-field/40 px-2 py-0.5 rounded border border-line/30">
                          Postal: {postalCode}
                        </span>
                      )}
                      {hasCoords && (
                        <span className="font-mono text-xs text-ledger bg-ledger/10 px-2 py-0.5 rounded border border-ledger/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> GPS: {Number(lat).toFixed(4)},{" "}
                          {Number(lng).toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditStep(2)}
                    className="flex items-center gap-1 text-xs text-ledger hover:underline underline-offset-4 cursor-pointer shrink-0 font-medium"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/45">
                      <ImageIcon className="w-3 h-3 text-ledger" />
                      <span>Photographic Evidence</span>
                    </div>
                    {files.length > 0 ? (
                      <div className="flex gap-2.5 flex-wrap">
                        {files.map((file, idx) => (
                          <div
                            key={`${file.name}-${idx}`}
                            className="relative h-16 w-20 rounded-md border border-line overflow-hidden shadow-xs"
                          >
                            <Image
                              src={URL.createObjectURL(file)}
                              alt="Attached evidence preview"
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-ink/50 italic">
                        No photos attached (optional step)
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditStep(3)}
                    className="flex items-center gap-1 text-xs text-ledger hover:underline underline-offset-4 cursor-pointer shrink-0 font-medium"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-ink/55 bg-field/20 p-3 rounded-lg border border-line/30">
              <Clock className="w-4 h-4 text-ledger shrink-0" />
              <span>
                Standard City SLA: Triage & technician assignment begins within 24–48 hours of
                transmission.
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}
