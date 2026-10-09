import { Logo } from "@/components/shared/logo";
import type { ReactNode } from "react";

export default function AuthLayout({ children, panel }: { children: ReactNode; panel: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[45fr_55fr]">
      <div className="flex flex-col bg-paper px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <Logo className="w-fit text-ink" textClassName="text-lg" />

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        <p className="font-mono text-[0.6875rem] leading-relaxed text-ink/40">
          A public record for problems that get fixed, not filed away.
        </p>
      </div>

      <div className="relative hidden bg-ledger px-12 py-14 text-paper lg:flex lg:items-center lg:justify-center xl:px-20">
        {panel}
      </div>
    </div>
  );
}
