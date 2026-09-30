import { cn } from "@/lib/utils";

const units = [
  { key: "Active departments", value: "5", note: "all currently subscribing" },
  { key: "Field technicians", value: "38", note: "across 7 wards" },
  { key: "Wards served", value: "7", note: "full municipal coverage" },
  { key: "Last deployment", value: "v2.4.1", note: "Sep 20, 09:14 UTC" },
] as const;

const services = [
  { name: "Report intake", status: "operational", perms: "issue:create, issue:read" },
  { name: "Dispatch & routing", status: "operational", perms: "workorder:read, workorder:write" },
  { name: "Notifications", status: "operational", perms: "global:read" },
  { name: "Public ledger", status: "operational", perms: "global:read" },
] as const;

export default function SystemOverviewPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-12">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-ink">Platform Overview</h1>
        <p className="mt-2 font-body text-ink/60">
          The operating state of the Civix installation serving this municipality.
        </p>
      </div>

      <section aria-labelledby="resolved-heading">
        <h2 id="resolved-heading" className="sr-only">
          Issues resolved this month
        </h2>
        <div className="flex items-end gap-6">
          <p className="font-display text-6xl tabular-nums tracking-tight text-ink sm:text-7xl">
            14,208
          </p>
          <div className="pb-1.5">
            <p className="flex items-center gap-1.5 font-body text-sm font-medium text-ink">
              Issues resolved this month
              <span
                aria-hidden="true"
                className="size-1.5 animate-dot shrink-0 rounded-full bg-signal-resolved motion-reduce:animate-none"
              />
            </p>
            <p className="mt-1 font-mono text-xs text-ink/45">
              same figure as the public homepage ledger ·{" "}
              <span className="text-ledger">99.97% uptime</span>
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="units-heading">
          <h2 id="units-heading" className="font-display text-xl text-ink">
            Platform units
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {units.map((unit) => (
              <li key={unit.key} className="flex items-center justify-between gap-4 py-3.5">
                <p className="font-body text-sm text-ink/70">{unit.key}</p>
                <p className="text-right">
                  <span className="block font-mono text-sm tabular-nums text-ink">
                    {unit.value}
                  </span>
                  <span className="block font-body text-xs text-ink/40">{unit.note}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="services-heading">
          <h2 id="services-heading" className="font-display text-xl text-ink">
            Services & permissions
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {services.map((service) => (
              <li key={service.name} className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <p className="font-body text-sm font-medium text-ink">{service.name}</p>
                  <p className="mt-0.5 font-mono text-[0.6875rem] text-ink/40">{service.perms}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xs border px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.05em]",
                    service.status === "operational"
                      ? "border-signal-resolved/30 bg-signal-resolved/[0.08] text-signal-resolved"
                      : "border-signal-open/30 bg-signal-open/[0.08] text-signal-open",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 rounded-full",
                      service.status === "operational"
                        ? "bg-signal-resolved"
                        : "animate-dot bg-signal-open motion-reduce:animate-none",
                    )}
                  />
                  {service.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
