import { cn } from "@/lib/utils";

type DepartmentRow = {
  name: string;
  compliance: number;
  self?: boolean;
  trend: "up" | "flat" | "down";
};

const departments: DepartmentRow[] = [
  { name: "Water & Sewage", compliance: 94, trend: "up" },
  { name: "Public Works", compliance: 87, self: true, trend: "up" },
  { name: "Electrical Services", compliance: 82, trend: "flat" },
  { name: "Solid Waste", compliance: 76, trend: "down" },
  { name: "Parks & Recreation", compliance: 71, trend: "down" },
];

const TREND_GLYPH = { up: "+", flat: "·", down: "–" } as const;

function ComplianceBar({ value }: { value: number }) {
  return (
    <span
      className="flex h-1.5 w-full min-w-24 max-w-40 overflow-hidden rounded-xs bg-field"
      aria-hidden="true"
    >
      <span
        className={cn(
          "h-full rounded-xs",
          value >= 85
            ? "bg-signal-resolved"
            : value >= 60
              ? "bg-signal-progress"
              : "bg-signal-open",
        )}
        style={{ width: `${value}%` }}
      />
    </span>
  );
}

export default function DepartmentOverviewPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-12">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-ink">Department Overview</h1>
        <p className="mt-2 font-body text-ink/60">
          How Public Works is performing against its service-level agreements.
        </p>
      </div>

      <section aria-labelledby="sla-heading">
        <h2 id="sla-heading" className="sr-only">
          SLA compliance
        </h2>
        <div className="flex items-end gap-6">
          <p className="font-display text-6xl tabular-nums tracking-tight text-ink sm:text-7xl">
            87<span className="text-3xl text-ink/50">%</span>
          </p>
          <div className="pb-1.5">
            <p className="font-body text-sm font-medium text-ink">SLA compliance</p>
            <p className="mt-1 font-mono text-xs text-ink/45">
              87 of 100 work orders resolved within window ·{" "}
              <span className="text-ledger">up 4 pts</span> vs last week
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="depts-heading">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="depts-heading" className="font-display text-xl text-ink">
            Departmental ranking
          </h2>
        </div>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {departments.map((dept) => (
            <li
              key={dept.name}
              className={cn(
                "grid grid-cols-2 items-center gap-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)_6rem_2.5rem]",
                dept.self && "bg-ink/[0.02]",
              )}
            >
              <p
                className={cn(
                  "font-body text-sm",
                  dept.self ? "font-medium text-ink" : "text-ink/70",
                )}
              >
                {dept.name}
                {dept.self && (
                  <span className="ml-2 font-mono text-[0.625rem] uppercase tracking-[0.06em] text-ledger">
                    this department
                  </span>
                )}
              </p>
              <div className="hidden sm:block">
                <ComplianceBar value={dept.compliance} />
              </div>
              <p className="font-mono text-sm tabular-nums text-ink">{dept.compliance}%</p>
              <p
                className={cn(
                  "text-right font-mono text-sm tabular-nums",
                  dept.trend === "up" && "text-signal-resolved",
                  dept.trend === "flat" && "text-ink/40",
                  dept.trend === "down" && "text-signal-open",
                )}
                title={`trend ${dept.trend}`}
              >
                {TREND_GLYPH[dept.trend]}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
