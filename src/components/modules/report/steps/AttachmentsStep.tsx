"use client";

import { Camera, Info, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE_MB = 8;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

interface AttachmentsStepProps {
  files: File[];
  onChange: (files: File[]) => void;
  onSkip?: () => void;
}

export function AttachmentsStep({ files, onChange, onSkip }: AttachmentsStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndAddFiles = useCallback(
    (incoming: File[]) => {
      const validFiles: File[] = [];

      for (const file of incoming) {
        if (!file.type.startsWith("image/") && !ALLOWED_MIME_TYPES.includes(file.type)) {
          toast.error(`"${file.name}" is not a supported image file.`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      const combined = [...files, ...validFiles];

      if (combined.length > MAX_PHOTOS) {
        toast.warning(`Maximum ${MAX_PHOTOS} photos allowed per report.`);
        onChange(combined.slice(0, MAX_PHOTOS));
      } else {
        onChange(combined);
      }
    },
    [files, onChange],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      if (selected.length > 0) validateAndAddFiles(selected);
      e.target.value = "";
    },
    [validateAndAddFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files || []);
      if (dropped.length > 0) validateAndAddFiles(dropped);
    },
    [validateAndAddFiles],
  );

  const removeFile = useCallback(
    (index: number) => {
      const updated = files.filter((_, i) => i !== index);
      onChange(updated);
    },
    [files, onChange],
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-slide-up motion-reduce:animate-none">
      <div className="space-y-1">
        <p className="font-display text-base font-medium text-ink">
          Attach visual evidence (Optional)
        </p>
        <p className="font-body text-xs text-ink/65 leading-relaxed">
          Photos allow dispatchers and technicians to identify required equipment and crew size
          before departing.
        </p>
      </div>

      {files.length < MAX_PHOTOS && (
        <label
          htmlFor="photo-upload"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line/80 bg-field/20 p-8 text-center transition-all duration-150",
            "hover:border-ink/50 hover:bg-field/30",
            isDragging && "border-ledger bg-ledger/[0.06] scale-[0.99]",
          )}
        >
          <input
            ref={inputRef}
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="sr-only"
          />
          <div className="h-12 w-12 rounded-full bg-ledger/10 text-ledger flex items-center justify-center">
            <Camera className="h-6 w-6 sm:hidden" />
            <Upload className="hidden h-6 w-6 sm:block" />
          </div>
          <div>
            <p className="font-display text-sm font-medium text-ink">
              Upload photos or take with camera
            </p>
            <p className="font-mono text-[11px] text-ink/50 mt-0.5">
              JPG, PNG, or WebP up to {MAX_FILE_SIZE_MB}MB each (max {MAX_PHOTOS} photos)
            </p>
          </div>
          <span className="font-body text-xs font-medium text-ledger border border-ledger/40 px-3.5 py-1.5 rounded-full hover:bg-ledger/10 transition-colors">
            Select from device
          </span>
        </label>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-ink/50">
            <span>
              Attached photos ({files.length}/{MAX_PHOTOS})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${file.size}-${idx}`}
                className="group relative aspect-video rounded-lg border border-line overflow-hidden bg-paper shadow-xs"
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Attached photo evidence"
                  fill
                  unoptimized
                  className="object-cover transition-transform group-hover:scale-105 duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                <span className="absolute bottom-1.5 left-2 font-mono text-[10px] text-white/90 truncate max-w-[70%]">
                  {formatFileSize(file.size)}
                </span>

                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-signal-open transition-colors cursor-pointer"
                  aria-label="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 p-3.5 rounded-lg border border-line/40 bg-field/20">
        <Info className="h-4 w-4 text-ledger shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-ink/70">
          <p className="font-semibold text-ink">Field inspection tip:</p>
          <p className="leading-relaxed">
            If possible, take one wide photo showing surrounding street landmarks, and one close-up
            of the actual damage.
          </p>
        </div>
      </div>

      {onSkip && files.length === 0 && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onSkip}
            className="font-body text-xs text-ink/50 underline decoration-line/40 underline-offset-4 hover:text-ink hover:decoration-ink cursor-pointer transition-colors"
          >
            I don't have photos right now — skip to review
          </button>
        </div>
      )}
    </div>
  );
}
