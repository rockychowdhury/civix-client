"use client";

import { useCallback, useRef, useState } from "react";
import { ProgressRail } from "@/components/ui/progress-rail";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Container } from "./container";

const steps = [
  {
    id: 1,
    label: "Report",
    title: "Submit a complaint",
    description: "File a report with category, location, and photos through the Civix platform.",
    responsible: "You — the citizen",
  },
  {
    id: 2,
    label: "Route",
    title: "Automatic routing",
    description:
      "The system routes the report to the correct department based on category and location.",
    responsible: "Civix engine — automatic",
  },
  {
    id: 3,
    label: "Resolve",
    title: "Department action",
    description: "The responsible department works on the issue and updates its status.",
    responsible: "City department",
  },
  {
    id: 4,
    label: "Confirm",
    title: "Resolution confirmed",
    description: "You receive notification when the issue is resolved. The loop closes.",
    responsible: "Civix + City",
  },
];

const navButton =
  "flex size-10 items-center justify-center rounded-xs border border-line font-body text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-ink";

export function HowCivixWorks() {
  const prefersReducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollToStep = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(steps.length - 1, index));
      const slide = track.children[clamped] as HTMLElement | undefined;
      if (!slide) return;
      track.scrollTo({
        left: slide.offsetLeft - track.offsetLeft,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [prefersReducedMotion],
  );

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let smallest = Number.POSITIVE_INFINITY;
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const childCenter = el.offsetLeft - track.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(childCenter - center);
      if (distance < smallest) {
        smallest = distance;
        nearest = i;
      }
    });
    setActive(nearest);
  };

  return (
    <section aria-labelledby="how-it-works-heading" className="py-20 sm:py-24">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-signal-resolved">
              The loop
            </p>
            <h2
              id="how-it-works-heading"
              className="mt-2 font-display text-[clamp(1.75rem,3vw,2.25rem)] font-normal leading-tight text-ink"
            >
              How Civix works
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollToStep(active - 1)}
              disabled={active === 0}
              aria-label="Previous step"
              className={navButton}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollToStep(active + 1)}
              disabled={active === steps.length - 1}
              aria-label="Next step"
              className={navButton}
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {steps.map((step, i) => {
            const isActive = i === active;
            return (
              <article
                key={step.id}
                className={`flex shrink-0 basis-[85%] snap-center flex-col rounded-xs border p-6 transition-colors sm:basis-[calc(50%-10px)] lg:basis-[calc(25%-15px)] ${
                  isActive ? "border-ledger bg-ledger/[0.04]" : "border-line bg-paper"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full font-display text-base font-bold transition-colors ${
                      isActive ? "bg-ledger text-paper" : "bg-paper text-ledger ring-1 ring-line"
                    }`}
                  >
                    {step.id}
                  </span>
                  <span className="font-body text-xs font-medium uppercase tracking-[0.05em] text-ink/50">
                    {step.label}
                  </span>
                </div>
                <h3 className="mt-5 font-body text-base font-medium leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-ink/60">
                  {step.description}
                </p>
                <p className="mt-auto pt-5 font-mono text-[0.6875rem] font-medium text-ledger">
                  → {step.responsible}
                </p>
              </article>
            );
          })}
        </div>

        <ProgressRail currentStep={active + 1} totalSteps={steps.length} className="mt-8" />

        <p className="mt-6 font-body text-sm leading-relaxed text-ink/55">
          No smartphone? Report by SMS to{" "}
          <a
            href="sms:16263"
            className="font-mono text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
          >
            16263
          </a>{" "}
          or send the same details on WhatsApp — the exact same tracking loop applies.
        </p>
      </Container>
    </section>
  );
}
