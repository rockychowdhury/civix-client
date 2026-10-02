"use client";

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
      children={(data: any) => (
        <div className="space-y-6 animate-slide-up motion-reduce:animate-none">
          <div className="rounded-xl border border-line bg-paper overflow-hidden">
            <div className="bg-ink/[0.02] border-b border-line px-5 py-4 flex justify-between items-center">
              <h3 className="font-display text-base font-medium text-ink">Report Summary</h3>
            </div>
            <div className="divide-y divide-line">
              <div className="p-5 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-ink/50 uppercase tracking-wider">Category</p>
                  <p className="font-medium text-ink">
                    {selectedCategory?.name || "Unknown Category"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEditStep(0)}
                  className="text-sm text-ledger hover:underline underline-offset-4"
                >
                  Edit
                </button>
              </div>

              <div className="p-5 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-ink/50 uppercase tracking-wider">
                    Description
                  </p>
                  <p className="text-sm text-ink/80 whitespace-pre-wrap">
                    {data.request?.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEditStep(1)}
                  className="text-sm text-ledger hover:underline underline-offset-4"
                >
                  Edit
                </button>
              </div>

              <div className="p-5 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-ink/50 uppercase tracking-wider">Location</p>
                  <p className="text-sm text-ink/80">
                    {data.location?.address || "Address not provided"}
                  </p>
                  {data.location?.landmark && (
                    <p className="text-sm text-ink/60">Landmark: {data.location.landmark}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onEditStep(2)}
                  className="text-sm text-ledger hover:underline underline-offset-4"
                >
                  Edit
                </button>
              </div>

              <div className="p-5 flex justify-between items-start gap-4">
                <div className="space-y-2 w-full">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-mono text-ink/50 uppercase tracking-wider">Photos</p>
                    <button
                      type="button"
                      onClick={() => onEditStep(3)}
                      className="text-sm text-ledger hover:underline underline-offset-4"
                    >
                      Edit
                    </button>
                  </div>
                  {files.length > 0 ? (
                    <div className="flex gap-2 mt-2">
                      {files.map((file) => (
                        <div
                          key={`${file.name}-${file.size}-${file.lastModified}`}
                          className="relative h-16 w-16 rounded-md border border-line overflow-hidden"
                        >
                          <Image
                            src={URL.createObjectURL(file)}
                            alt="Uploaded photo preview"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink/50">No photos added</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    />
  );
}
