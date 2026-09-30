"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { StatusPill } from "@/components/modules/dashboard/StatusPill";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@/hooks/auth.hook";

type ActiveReport = {
  id: string;
  category: string;
  location: string;
  status: string;
  updated: string;
  accent: "open" | "progress" | "resolved";
};

const activeReports: ActiveReport[] = [
  {
    id: "REQ-260920-0001",
    category: "Water Leakage",
    location: "23 Mazar Road",
    status: "IN_PROGRESS",
    updated: "2h ago",
    accent: "progress",
  },
  {
    id: "REQ-260918-0032",
    category: "Pothole",
    location: "St. Anne's Junction",
    status: "OPEN",
    updated: "2 days ago",
    accent: "open",
  },
  {
    id: "REQ-260915-0017",
    category: "Drainage",
    location: "College Road",
    status: "SUGGESTED",
    updated: "4 days ago",
    accent: "progress",
  },
];

const ACCENT_CLASSES = {
  open: "bg-signal-open",
  progress: "bg-signal-progress",
  resolved: "bg-signal-resolved",
} as const;

export default function CitizenOverviewPage() {
  const { data: user } = useGetMe();
  const firstName = user?.citizenProfile?.firstName ?? "there";

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
            Good morning, {firstName}
          </h1>
          <p className="mt-2 max-w-md font-body leading-relaxed text-ink/60">
            Here&apos;s how the issues you&apos;ve reported are doing — and what&apos;s happening in
            your neighborhood.
          </p>
        </div>
        <Link href="/report">
          <Button className="gap-2">
            Report an issue <ArrowRight className="size-4" />
          </Button>
        </Link>
      </header>

      <section aria-labelledby="active-heading">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="active-heading" className="font-display text-xl text-ink">
            Active reports
          </h2>
          <Link
            href="/citizen/my-reports"
            className="font-body text-sm text-ink/50 transition-colors hover:text-ink"
          >
            View all reports
          </Link>
        </div>

        <ul className="mt-4 divide-y divide-line border-y border-line">
          {activeReports.map((report) => (
            <li key={report.id} className="flex items-center gap-4 py-4">
              <span
                aria-hidden="true"
                className={`size-2.5 shrink-0 rounded-full ${ACCENT_CLASSES[report.accent]}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-sm font-medium text-ink">{report.category}</p>
                <p className="truncate font-body text-xs text-ink/50">
                  <span className="font-mono">{report.id}</span> · {report.location}
                </p>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <StatusPill status={report.status} />
                <span className="font-mono text-xs tabular-nums text-ink/40">{report.updated}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
