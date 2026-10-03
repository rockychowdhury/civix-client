import { cn } from "cn";
import type * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[100px] w-full appearance-none rounded-xs border border-line bg-field px-3.5 py-2 font-body text-base text-ink caret-ledger transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-ink/50 hover:border-ink/45 focus-visible:border-ledger focus-visible:ring-2 focus-visible:ring-ledger/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-signal-open aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-signal-open/25 resize-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
