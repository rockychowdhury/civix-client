"use client";

import { useEffect } from "react";

import { useStoredValue } from "@/hooks/useStoredValue";
import { setStoredValue } from "@/lib/local-storage-store";
import { cn } from "@/lib/utils";

const TEXT_SCALES = [
  { label: "A", value: 100, ariaLabel: "Default text size" },
  { label: "A+", value: 112, ariaLabel: "Larger text size" },
  { label: "A++", value: 125, ariaLabel: "Largest text size" },
] as const;

const TEXT_KEY = "civix-text-scale";
const CONTRAST_KEY = "civix-high-contrast";

export function AccessibilityControls({ className }: { className?: string }) {
  const storedScale = useStoredValue(TEXT_KEY);
  const scale = TEXT_SCALES.find((option) => String(option.value) === storedScale)?.value ?? 100;
  const contrast = useStoredValue(CONTRAST_KEY) === "true";

  useEffect(() => {
    document.documentElement.style.fontSize = scale === 100 ? "" : `${scale}%`;
  }, [scale]);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", contrast);
  }, [contrast]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-3 font-body text-xs text-paper/60",
        className,
      )}
    >
      <fieldset className="m-0 flex min-w-0 items-center gap-1 border-0 p-0">
        <legend className="sr-only">Text size</legend>
        <span className="mr-1">Text size</span>
        {TEXT_SCALES.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={scale === option.value}
            aria-label={option.ariaLabel}
            onClick={() => setStoredValue(TEXT_KEY, String(option.value))}
            className={cn(
              "rounded-xs border border-paper/20 px-1.5 py-0.5 transition-colors hover:text-paper",
              scale === option.value && "border-paper/60 text-paper",
            )}
          >
            {option.label}
          </button>
        ))}
      </fieldset>

      <button
        type="button"
        role="switch"
        aria-checked={contrast}
        onClick={() => setStoredValue(CONTRAST_KEY, contrast ? "false" : "true")}
        className={cn(
          "rounded-xs border border-paper/20 px-2 py-0.5 transition-colors hover:text-paper",
          contrast && "border-paper/60 text-paper",
        )}
      >
        High contrast: {contrast ? "on" : "off"}
      </button>
    </div>
  );
}
