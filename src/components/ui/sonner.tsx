"use client";

import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      closeButton
      style={
        {
          "--border-radius": "2px",
          "--normal-bg": "var(--color-paper)",
          "--normal-text": "var(--color-ink)",
          "--normal-border": "var(--color-line)",
          "--success-border": "var(--color-signal-resolved)",
          "--error-border": "var(--color-signal-open)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "!rounded-xs !border !border-line !bg-paper !font-body !text-ink !shadow-none",
          title: "!font-body !text-sm !font-medium !text-ink",
          description: "!font-body !text-xs !leading-relaxed !text-ink/70",
          actionButton:
            "!rounded-xs !border !border-black/25 !bg-ledger !font-body !text-xs !text-paper",
          cancelButton:
            "!rounded-xs !border !border-line !bg-transparent !font-body !text-xs !text-ink/70",
          closeButton: "!border-line !bg-paper !text-ink/60",
          icon: "!text-ink",
        },
        ...toastOptions,
      }}
      {...props}
    />
  );
}

export { Toaster };
