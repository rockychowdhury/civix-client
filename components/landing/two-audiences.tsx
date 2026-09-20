import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TwoAudiences() {
  return (
    <section aria-labelledby="two-audiences-heading">
      <h2 id="two-audiences-heading" className="sr-only">
        Two Audiences, One System
      </h2>

      <div className="grid">
        <div className="flex min-h-[320px] flex-col justify-center bg-paper px-5 py-20 text-ink sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto w-full max-w-[480px]">
            <p className="mb-8 font-body text-[clamp(1.125rem,2.5vw,1.375rem)] leading-relaxed text-ink">
              Report your city&apos;s issues once and watch them get fixed. Civix tracks every
              complaint from submission to resolution, so you always know where things stand.
            </p>
            <Button asChild>
              <Link href="/register">Report an Issue</Link>
            </Button>
          </div>
        </div>

        <div className="flex min-h-[320px] flex-col justify-center bg-ledger px-5 py-20 text-paper sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto w-full max-w-[480px]">
            <p className="mb-8 font-body text-[clamp(1.125rem,2.5vw,1.375rem)] leading-relaxed text-paper">
              Built for departments that need real routing, SLA enforcement, and audit trails. Civix
              gives municipalities the tools to close the loop on every report — automatically.
            </p>
            <Button asChild variant="inverse">
              <Link href="/municipalities">Municipal portal</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
