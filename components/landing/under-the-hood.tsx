"use client";

import { type ReactNode, useState } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Container } from "./container";

type DrawerItem = {
  id: string;
  title: string;
  explanation: string;
  diagram: ReactNode;
};

const drawerItems: DrawerItem[] = [
  {
    id: "duplicates",
    title: "Duplicate reports are automatically merged",
    explanation:
      "When two reports describe the same issue at the same location, Civix merges them into a single case, preventing duplicate work and keeping statistics accurate. Location proximity and category matching identify duplicates within minutes of submission.",
    diagram: (
      <svg
        viewBox="0 0 220 44"
        className="h-11 w-full max-w-[220px]"
        role="img"
        aria-label="Two reports merging into one case"
      >
        <circle cx="10" cy="12" r="4" fill="var(--color-signal-open)" />
        <circle cx="10" cy="32" r="4" fill="var(--color-signal-open)" />
        <path d="M14 12H70L100 22" stroke="var(--color-line)" strokeWidth="1.5" fill="none" />
        <path d="M14 32H70L100 22" stroke="var(--color-line)" strokeWidth="1.5" fill="none" />
        <rect x="100" y="14" width="110" height="16" fill="var(--color-ledger)" />
        <text x="108" y="25" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-paper)">
          1 merged case
        </text>
      </svg>
    ),
  },
  {
    id: "sla",
    title: "An SLA engine enforces every deadline",
    explanation:
      "Each report gets a deadline by department, based on category and severity. If a department misses it, the issue escalates automatically — no one has to ask twice. Escalation paths are configurable per municipality and recorded in the public audit log.",
    diagram: (
      <svg
        viewBox="0 0 220 44"
        className="h-11 w-full max-w-[220px]"
        role="img"
        aria-label="Timeline with an escalating deadline"
      >
        <line x1="8" y1="22" x2="212" y2="22" stroke="var(--color-line)" strokeWidth="1.5" />
        <rect x="8" y="18" width="70" height="8" fill="var(--color-signal-resolved)" />
        <rect x="78" y="18" width="70" height="8" fill="var(--color-signal-open)" />
        <circle cx="148" cy="22" r="5" fill="var(--color-signal-open)" />
        <text x="156" y="26" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-ink)">
          escalates
        </text>
      </svg>
    ),
  },
  {
    id: "routing",
    title: "Complaints auto-route by category and location",
    explanation:
      "The platform categorizes every complaint and maps it to the correct municipal department without manual intervention. A rules engine evaluates 40+ factors — from GPS coordinates to departmental workload — to assign ownership in seconds, not days.",
    diagram: (
      <svg
        viewBox="0 0 220 44"
        className="h-11 w-full max-w-[220px]"
        role="img"
        aria-label="One report routed to the correct department"
      >
        <rect x="6" y="14" width="40" height="16" fill="var(--color-ink)" />
        <text x="12" y="25" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-paper)">
          intake
        </text>
        <path d="M46 22H120" stroke="var(--color-line)" strokeWidth="1.5" />
        <path
          d="M120 22 96 8M120 22 96 36M120 22 150 22"
          stroke="var(--color-line)"
          strokeWidth="1.5"
          fill="none"
        />
        <rect x="150" y="6" width="64" height="12" fill="var(--color-signal-resolved)" />
        <rect x="150" y="26" width="64" height="12" fill="var(--color-signal-resolved)" />
      </svg>
    ),
  },
];

export function UnderTheHood() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section aria-labelledby="under-hood-heading" className="py-20 sm:py-24">
      <Container className="max-w-[680px]">
        <h2 id="under-hood-heading" className="sr-only">
          Under the Hood
        </h2>

        <div className="flex flex-col">
          {drawerItems.map((item) => {
            const isOpen = openId === item.id;

            return (
              <Collapsible
                key={item.id}
                open={isOpen}
                onOpenChange={(open) => setOpenId(open ? item.id : null)}
                className="border-t border-line"
              >
                <CollapsibleTrigger className="group flex w-full items-center gap-6 py-6 text-left">
                  <span
                    className={cn(
                      "h-px shrink-0 bg-line transition-all duration-300 motion-reduce:transition-none",
                      isOpen ? "w-10 bg-ledger" : "w-5 group-hover:w-8",
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "flex-1 font-body text-[clamp(1rem,2vw,1.125rem)] leading-snug text-ink transition-[font-weight] duration-200 motion-reduce:transition-none",
                      isOpen ? "font-medium" : "font-normal",
                    )}
                  >
                    {item.title}
                  </span>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
                  <div className="pb-8 pl-12">
                    <p className="max-w-[60ch] font-body text-sm leading-relaxed text-ink/75">
                      {item.explanation}
                    </p>
                    <div className="mt-5">{item.diagram}</div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          <div className="border-t border-line" />
        </div>
      </Container>
    </section>
  );
}
