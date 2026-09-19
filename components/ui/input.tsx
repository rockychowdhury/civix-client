import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full appearance-none rounded-xs border border-line bg-field px-3.5 py-2 font-body text-base text-ink caret-ledger transition-[border-color,box-shadow,background-color] duration-150",
        "placeholder:text-ink/50",
        "hover:border-ink/45",
        "focus-visible:border-ledger focus-visible:ring-2 focus-visible:ring-ledger/25 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-signal-open aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-signal-open/25",
        "file:mr-3 file:border-0 file:bg-transparent file:font-body file:text-sm file:font-medium file:text-ink",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
