import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xs font-body text-sm font-medium",
    "transition-[transform,background-color,border-color,color,outline-color] duration-150 ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ledger",
    "active:translate-y-0 active:scale-[0.98] active:duration-75",
    "disabled:pointer-events-none disabled:opacity-50",
    "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "border border-black/25 bg-ledger text-paper hover:-translate-y-px hover:border-black/45",
        secondary:
          "border border-ledger/30 bg-transparent text-ledger hover:-translate-y-px hover:border-ledger",
        inverse:
          "border border-paper/40 bg-transparent text-paper hover:-translate-y-px hover:border-paper hover:bg-paper hover:text-ledger",
        ghost:
          "border border-transparent bg-transparent px-0 font-normal text-ink/60 hover:text-ink",
        destructive:
          "border border-black/25 bg-signal-open text-paper hover:-translate-y-px hover:border-black/45",
      },
      size: {
        default: "px-7 py-3",
        sm: "px-4 py-2 text-xs",
        lg: "px-8 py-4 text-base",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  loadingText = "Working…",
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    loadingText?: string;
  }) {
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <span className="relative inline-flex items-center justify-center overflow-hidden">
        <span
          className={cn(
            "inline-flex items-center gap-2 transition-opacity duration-150 motion-reduce:transition-none",
            loading && "opacity-0",
          )}
        >
          {children}
        </span>
        {loading && (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
          >
            {loadingText}
          </span>
        )}
      </span>
      {loading && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-px h-px overflow-hidden"
        >
          <span className="block h-full w-1/3 animate-button-progress bg-current motion-reduce:animate-none motion-reduce:w-full" />
        </span>
      )}
    </button>
  );
}

export { Button, buttonVariants };
