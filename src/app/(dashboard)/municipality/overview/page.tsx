import { cn } from "@/lib/utils";

type OpenIssue = {
  id: string;
  category: string;
  department: string;
  daysOpen: number;
};

const openIssues: OpenIssue[] = [
  {
    id: "REQ-260901-0002",
    category: "Streetlight",
    department: "Electrical Services",
    daysOpen: 21,
  },
  { id: "REQ-260905-0011", category: "Pothole", department: "Public Works", daysOpen: 17 },
  { id: "REQ-260908-0040", category: "Drainage", department: "Public Works", daysOpen: 14 },
  { id: "REQ-260912-0030", category: "Solid Waste", department: "Solid Waste", daysOpen: 10 },
];

type DepartmentHeat = {
  name: string;
  compliance: number;
};

const departmentHeat: DepartmentHeat[] = [
  { name: "Water & Sewage", compliance: 94 },
  { name: "Public Works", compliance: 87 },
  { name: "Electrical Services", compliance: 82 },
  { name: "Solid Waste", compliance: 76 },
  { name: "Parks & Recreation", compliance: 71 },
];

function HeatBar({ value }: { value: number }) {
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

export default function MunicipalityOverviewPage() {
  const targetDays = 14;

  return (
    <div className="flex max-w-5xl flex-col gap-12">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-ink">Municipality Overview</h1>
        <p className="mt-2 font-body text-ink/60">
          A single view of how the city is keeping its promises.
        </p>
      </div>

      <section aria-labelledby="median-heading">
        <h2 id="median-heading" className="sr-only">
          Median time to resolve
        </h2>
        <div className="flex items-end gap-6">
          <p className="font-display text-6xl tabular-nums tracking-tight text-ink sm:text-7xl">
            3d <span className="text-3xl text-ink/50">8h</span>
          </p>
          <div className="pb-1.5">
            <p className="font-body text-sm font-medium text-ink">Median time to resolve</p>
            <p className="mt-1 font-mono text-xs text-ink/45">
              across all departments · <span className="text-ledger">within the 14-day target</span>
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="open-heading">
          <h2 id="open-heading" className="font-display text-xl text-ink">
            Longest open issues
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {openIssues.map((issue) => {
              const over = issue.daysOpen > targetDays;
              return (
                <li key={issue.id} className="flex items-center gap-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-medium text-ink">
                      {issue.category}
                    </p>
                    <p className="truncate font-body text-xs text-ink/50">
                      <span className="font-mono">{issue.id}</span> · {issue.department}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "font-mono text-sm tabular-nums",
                      over ? "text-signal-open" : "text-ink/55",
                    )}
                  >
                    {issue.daysOpen}d
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="heat-heading">
          <h2 id="heat-heading" className="font-display text-xl text-ink">
            Department SLA compliance
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {departmentHeat.map((dept) => (
              <li key={dept.name} className="flex items-center gap-4 py-3.5">
                <p className="min-w-0 flex-1 truncate font-body text-sm text-ink/70">{dept.name}</p>
                <div className="hidden w-40 sm:block">
                  <HeatBar value={dept.compliance} />
                </div>
                <p className="font-mono text-sm tabular-nums text-ink">{dept.compliance}%</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
