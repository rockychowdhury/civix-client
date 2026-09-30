"use client";

import { Camera, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 3;

interface AttachmentsStepProps {
  files: File[];
  onChange: (files: File[]) => void;
  onSkip?: () => void;
}

export function AttachmentsStep({ files, onChange, onSkip }: AttachmentsStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const combined = [...files, ...incoming];

      if (combined.length > MAX_PHOTOS) {
        setLimitReached(true);
        onChange(combined.slice(0, MAX_PHOTOS));
      } else {
        setLimitReached(false);
        onChange(combined);
      }
    },
    [files, onChange],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      if (selected.length > 0) addFiles(selected);
      e.target.value = "";
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (dropped.length > 0) addFiles(dropped);
    },
    [addFiles],
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      onChange(newFiles);
      setLimitReached(false);
    },
    [files, onChange],
  );

  return (
    <div className="space-y-6 animate-slide-up motion-reduce:animate-none">
      <div className="space-y-1">
        <p className="font-body text-sm font-medium text-ink">
          Add photos to help us pinpoint the issue
        </p>
        <p className="font-body text-sm text-ink/60">
          Photos help technicians arrive prepared — attach up to {MAX_PHOTOS} photos.
        </p>
      </div>

      {/* Drop zone styled with the ledger/input treatment, not a dashed upload box */}
      <label
        htmlFor="photo-upload"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xs border border-line border-b-[3px] border-b-ledger/40 bg-field p-10 text-center transition-[border-color,background-color] duration-150",
          "hover:border-ink/45",
          "has-[:focus-visible]:border-ledger has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal-open has-[:focus-visible]:outline-offset-2",
          isDragging && "border-ledger border-b-ledger bg-ledger/[0.06]",
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
        <div className="rounded-full bg-ledger/10 p-4">
          {/* Camera icon only on mobile viewports, where it opens the device camera */}
          <Camera className="h-6 w-6 text-ledger sm:hidden" />
          <Upload className="hidden h-6 w-6 text-ledger sm:block" />
        </div>
        <div>
          <p className="font-display text-base font-medium text-ink">Tap to add photos</p>
          <p className="font-body text-sm text-ink/60">or drag and drop here</p>
        </div>
        <span className="inline-flex select-none items-center justify-center gap-2 rounded-xs border border-ledger/30 bg-transparent px-4 py-2 font-body text-xs font-medium text-ledger transition-colors hover:-translate-y-px hover:border-ledger">
          Choose files
        </span>
      </label>

      {limitReached && (
        <p className="text-sm font-medium text-signal-open" role="alert">
          You can attach up to {MAX_PHOTOS} photos per report — remove one to add another.
        </p>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="relative aspect-square rounded-xs border border-line overflow-hidden"
            >
              <Image
                src={URL.createObjectURL(file)}
                alt="Uploaded photo preview"
                fill
                unoptimized
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(files.indexOf(file))}
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
