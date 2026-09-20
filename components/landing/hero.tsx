import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "./container";
import { StatusCard } from "./status-card";
import { TrackReportForm } from "./track-report-form";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="pb-16 pt-20 sm:pb-24 sm:pt-28">
      <Container className="max-w-[1240px]">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <div className="lg:pt-3">
            <h1
              id="hero-heading"
              className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-ink"
            >
              Report it once. Watch it get fixed.
            </h1>
            <p className="mt-5 max-w-[46ch] font-body text-[clamp(1rem,2vw,1.125rem)] leading-relaxed text-ink/70">
              File a complaint and track its progress in real time — from submission to resolution.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/register">Report an Issue — takes 40 seconds</Link>
              </Button>
            </div>

            <div className="mt-10 max-w-[380px] border-t border-line pt-5">
              <p className="font-body text-sm text-ink/55">Already reported something? Track it.</p>
              <TrackReportForm className="mt-3" id="tracking-number-hero" />
            </div>
          </div>

          <StatusCard className="justify-self-start lg:justify-self-end" />
        </div>
      </Container>
    </section>
  );
}
