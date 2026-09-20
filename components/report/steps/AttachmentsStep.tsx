"use client";

import { Camera, Upload, X } from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface AttachmentsStepProps {
  files: File[];
  onChange: (files: File[]) => void;
  onSkip?: () => void;
}

export function AttachmentsStep({ files, onChange, onSkip }: AttachmentsStepProps) {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      const newFiles = [...files, ...selected].slice(0, 3);
      onChange(newFiles);
    },
    [files, onChange],
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      onChange(newFiles);
    },
    [files, onChange],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <p className="font-body text-sm font-medium text-ink">
          Issues with a photo get resolved 40% faster on average.
        </p>
      </div>

      <div className="relative group">
        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={files.length >= 3}
          aria-label="Upload photos"
        />
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-line bg-paper p-10 text-center transition-colors group-hover:border-ink/50 group-hover:bg-ink/[0.02]",
            files.length >= 3 && "opacity-50 pointer-events-none",
          )}
        >
          <div className="rounded-full bg-ledger/10 p-4">
            {/* Show camera icon on small screens, upload on large */}
            <Camera className="h-6 w-6 text-ledger sm:hidden" />
            <Upload className="hidden h-6 w-6 text-ledger sm:block" />
          </div>
          <div>
            <p className="font-display text-base font-medium text-ink">Tap to add photos</p>
            <p className="font-body text-sm text-ink/60">or drag and drop here</p>
          </div>
          <p className="text-xs text-ink/40 font-mono">Up to 3 photos per report</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {files.map((file, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-md border border-line bg-ink/5 overflow-hidden"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Attachment ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {onSkip && files.length === 0 && (
        <div className="text-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-ink/50 underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}
