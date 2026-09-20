"use client";

import { useState } from "react";
import { Container } from "./container";

const stories = [
  {
    id: 1,
    title: "Streetlight outage on Maple Avenue",
    tracking: "CVX-2026-004821",
    category: "Street Lighting",
    ward: "Downtown",
    report:
      "Streetlight out at 123 Maple Ave — darkness all night, safety concern for pedestrians crossing at the intersection.",
    timeline: [
      { status: "Submitted", time: "Nov 3, 7:14 PM", actor: "Citizen" },
      { status: "Routed", time: "Nov 3, 7:16 PM", actor: "System" },
      { status: "Assigned", time: "Nov 4, 9:02 AM", actor: "Roads Dept." },
      { status: "In Progress", time: "Nov 4, 10:45 AM", actor: "Technician M. Chen" },
      { status: "Resolved", time: "Nov 4, 3:45 PM", actor: "Roads Dept." },
    ],
    beforeDesc: "Dark intersection at Maple Ave & 5th St — no illumination for 200ft radius",
    afterDesc: "LED fixture replaced, intersection fully illuminated, photometric test passed",
  },
  {
    id: 2,
    title: "Pothole on 4th Avenue",
    tracking: "CVX-2026-005112",
    category: "Road Maintenance",
    ward: "East Side",
    report:
      "Pothole reported on 4th Avenue — growing each day, risk to vehicles and cyclists in bike lane.",
    timeline: [
      { status: "Submitted", time: "Oct 28, 2:31 PM", actor: "Citizen" },
      { status: "Routed", time: "Oct 28, 2:33 PM", actor: "System" },
      { status: "Assigned", time: "Oct 29, 8:15 AM", actor: "Roads Dept." },
      { status: "In Progress", time: "Oct 29, 9:30 AM", actor: "Crew 7" },
      { status: "Resolved", time: "Oct 29, 4:20 PM", actor: "Roads Dept." },
    ],
    beforeDesc: "6-inch deep pothole spanning bike lane and traffic lane on 4th Ave",
    afterDesc: "Hot-mix asphalt patch applied, compacted, and sealed — road surface restored",
  },
];

export function ResolvedStories() {
  const [current, setCurrent] = useState(0);
  const story = stories[current];

  return (
    <section aria-labelledby="resolved-stories-heading" className="py-20 sm:py-24">
      <Container className="max-w-[720px]">
        <h2 id="resolved-stories-heading" className="sr-only">
          Resolved Stories
        </h2>

        <div className="mb-12 flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
            <div>
              <span className="font-body text-xs font-medium uppercase tracking-[0.05em] text-signal-resolved">
                Case study
              </span>
              <h3 className="mt-2 font-display text-[clamp(1.5rem,3vw,2rem)] font-normal leading-tight text-ink">
                {story.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <span className="font-mono text-xs text-ink/50">{story.tracking}</span>
              <span className="font-mono text-xs text-ink/50">
                {story.category} · {story.ward}
              </span>
            </div>
          </div>

          <div className="grid gap-8">
            <div className="grid gap-6">
              <div className="flex flex-col gap-6 rounded-xs bg-ink p-8 text-paper">
                <div className="flex flex-col gap-4">
                  <span className="font-body text-xs font-medium uppercase tracking-[0.05em] text-signal-open">
                    Before
                  </span>
                  <p className="font-body text-[0.9375rem] leading-relaxed text-paper/90">
                    {story.beforeDesc}
                  </p>
                </div>
                <div className="h-px bg-line/30" />
                <div className="flex flex-col gap-4">
                  <span className="font-body text-xs font-medium uppercase tracking-[0.05em] text-signal-resolved">
                    After
                  </span>
                  <p className="font-body text-[0.9375rem] leading-relaxed text-paper/90">
                    {story.afterDesc}
                  </p>
                </div>
              </div>

              <div className="rounded-xs border border-line bg-paper p-8">
                <p className="mb-4 font-body text-xs font-medium uppercase tracking-[0.05em] text-ink/50">
                  Original report
                </p>
                <blockquote className="border-l-[3px] border-signal-open pl-6 font-body text-[0.9375rem] italic leading-relaxed text-ink">
                  &ldquo;{story.report}&rdquo;
                </blockquote>
              </div>
            </div>

            <div className="rounded-xs border border-line bg-paper p-8">
              <p className="mb-6 font-body text-xs font-medium uppercase tracking-[0.05em] text-ink/50">
                Resolution timeline
              </p>
              <div className="flex flex-col gap-4">
                {story.timeline.map((entry, i) => {
                  const isLast = i === story.timeline.length - 1;
                  return (
                    <div
                      key={entry.status}
                      className={`relative flex items-start gap-6 border-l-2 pl-6 ${
                        isLast ? "border-signal-resolved" : "border-line"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute -left-1.5 top-0.5 size-2.5 rounded-full ${
                          isLast ? "bg-signal-resolved" : "border-2 border-paper bg-line"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-body text-sm leading-tight ${
                            isLast ? "font-medium text-signal-resolved" : "font-normal text-ink"
                          }`}
                        >
                          {entry.status}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-ink/50">
                          {entry.time} — {entry.actor}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 border-t border-line pt-6">
          {stories.map((story, i) => (
            <button
              key={story.id}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`View case study ${i + 1}`}
              aria-current={i === current ? "true" : "false"}
              className={`flex size-7 items-center justify-center rounded-xs font-mono text-xs transition-colors ${
                i === current ? "bg-ledger text-paper" : "bg-line text-ink hover:bg-ledger/20"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
