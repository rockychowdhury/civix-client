import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "./container";

const wardData = [
  { ward: "Downtown", open: 42, resolved: 38, x: 52, y: 35 },
  { ward: "East Side", open: 28, resolved: 51, x: 78, y: 45 },
  { ward: "West End", open: 35, resolved: 44, x: 22, y: 48 },
  { ward: "North Ward", open: 19, resolved: 67, x: 48, y: 18 },
  { ward: "South Ward", open: 31, resolved: 49, x: 55, y: 78 },
  { ward: "Riverside", open: 15, resolved: 23, x: 82, y: 72 },
  { ward: "University", open: 24, resolved: 41, x: 15, y: 32 },
];

const medianDays = 3.2;

export function TransparencyDashboard() {
  return (
    <section aria-labelledby="transparency-heading" className="py-20 sm:py-24">
      <Container>
        <h2 id="transparency-heading" className="sr-only">
          Transparency Dashboard
        </h2>

        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="relative">
            <div
              role="img"
              aria-label="City ward map showing open and resolved issue density. Open issues shown in rust, resolved in forest green."
              className="relative aspect-[4/3] overflow-hidden rounded-xs bg-ink"
            >
              <svg
                viewBox="0 0 100 75"
                preserveAspectRatio="none"
                className="h-full w-full"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="open-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--color-signal-open)" stopOpacity="0.15" />
                    <stop offset="70%" stopColor="var(--color-signal-open)" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="resolved-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--color-signal-resolved)" stopOpacity="0.15" />
                    <stop offset="70%" stopColor="var(--color-signal-resolved)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect x="0" y="0" width="100" height="75" fill="var(--color-ink)" />

                <path
                  d="M10,10 L90,10 L90,65 L10,65 Z"
                  fill="none"
                  stroke="var(--color-line)"
                  strokeWidth="0.5"
                  opacity="0.3"
                />

                {wardData.map((ward) => (
                  <g key={ward.ward}>
                    <circle
                      cx={ward.x}
                      cy={ward.y}
                      r={Math.max(8, (ward.open / 67) * 18)}
                      fill="var(--color-signal-open)"
                      fillOpacity="0.25"
                      filter="url(#open-glow)"
                    />
                    <circle
                      cx={ward.x}
                      cy={ward.y}
                      r={Math.max(5, (ward.resolved / 67) * 14)}
                      fill="var(--color-signal-resolved)"
                      fillOpacity="0.35"
                      filter="url(#resolved-glow)"
                    />
                    <circle
                      cx={ward.x}
                      cy={ward.y}
                      r={Math.max(3, (ward.open / 67) * 8)}
                      fill="var(--color-signal-open)"
                      fillOpacity="0.5"
                    />
                    <circle
                      cx={ward.x}
                      cy={ward.y}
                      r={Math.max(2, (ward.resolved / 67) * 6)}
                      fill="var(--color-signal-resolved)"
                      fillOpacity="0.6"
                    />
                    <text
                      x={ward.x}
                      y={ward.y - 12}
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                      fontSize="4"
                      fill="var(--color-paper)"
                      opacity="0.7"
                    >
                      {ward.ward}
                    </text>
                  </g>
                ))}
              </svg>

              <div aria-hidden="true" className="absolute inset-x-6 bottom-6 flex flex-wrap gap-6">
                <span className="flex items-center gap-2 font-body text-xs text-paper/60">
                  <span className="size-2.5 rounded-full bg-signal-open/60" />
                  Open density
                </span>
                <span className="flex items-center gap-2 font-body text-xs text-paper/60">
                  <span className="size-2.5 rounded-full bg-signal-resolved/70" />
                  Resolved density
                </span>
              </div>
            </div>

            <p className="mt-6 text-center font-body text-[0.8125rem] text-ink/50">
              Issues by ward — density visualization using semantic signal colors
            </p>
          </div>

          <div className="flex flex-col items-start">
            <div className="mb-4 flex flex-wrap items-baseline gap-4">
              <span className="font-display text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.05] text-ink">
                {medianDays}
              </span>
              <span className="mb-[0.2em] self-end font-body text-[clamp(1rem,2.5vw,1.25rem)] text-ink/70">
                days
              </span>
            </div>
            <p className="mb-8 max-w-[320px] font-body text-[clamp(0.875rem,1.5vw,1rem)] leading-relaxed text-ink/60">
              Median time to resolution across all active municipalities
            </p>
            <Button asChild variant="ghost">
              <Link href="/data">View full public data →</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
