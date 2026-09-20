import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="flex max-w-[480px] flex-col items-start gap-6">
        {/* 404 Display */}
        <p className="font-mono text-[clamp(4rem,10vw,6rem)] font-medium leading-none tracking-tight text-line">
          404
        </p>

        {/* Heading */}
        <h1 className="font-display text-[clamp(1.5rem,4vw,2.25rem)] leading-tight text-ink">
          This page doesn&apos;t exist
        </h1>

        {/* Description */}
        <p className="font-body text-[0.9375rem] leading-relaxed text-ink/60">
          The page you&apos;re looking for may have been moved, removed, or
          never existed. If you followed a link here, let us know so we can fix
          it.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button asChild variant="primary" size="sm">
            <Link href="/">Back to homepage</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
        </div>

        {/* Decorative line */}
        <div className="mt-4 h-px w-full bg-line/40" />
        <p className="font-mono text-[0.6875rem] text-ink/30">
          Civix — A public record for problems that get fixed, not filed away.
        </p>
      </div>
    </div>
  );
}
