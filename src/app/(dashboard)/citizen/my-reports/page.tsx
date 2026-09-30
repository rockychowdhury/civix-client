"use client";

import { useState } from "react";

import { DataTable, type DataTableColumn } from "@/components/modules/dashboard/DataTable";
import { StatusPill } from "@/components/modules/dashboard/StatusPill";
import { cn } from "@/lib/utils";

type ReportRow = {
  id: string;
  category: string;
  location: string;
  submitted: string;
  status: string;
};

const reports: ReportRow[] = [
  {
    id: "REQ-260920-0001",
    category: "Water Leakage",
    location: "23 Mazar Road",
    submitted: "Sep 20",
    status: "IN_PROGRESS",
  },
  {
    id: "REQ-260918-0032",
    category: "Pothole",
    location: "St. Anne's Junction",
    submitted: "Sep 18",
    status: "OPEN",
  },
  {
    id: "REQ-260915-0017",
    category: "Drainage",
    location: "College Road",
    submitted: "Sep 15",
    status: "SUGGESTED",
  },
  {
    id: "REQ-260912-0044",
    category: "Streetlight",
    location: "Ring Road",
    submitted: "Sep 12",
    status: "RESOLVED",
  },
  {
    id: "REQ-260910-0088",
    category: "Garbage Collection",
    location: "Park Side",
    submitted: "Sep 10",
    status: "RESOLVED",
  },
  {
    id: "REQ-260905-0011",
    category: "Water Leakage",
    location: "Old Quarter",
    submitted: "Sep 5",
    status: "RESOLVED",
  },
];

const FILTERS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"] as const;

const columns: DataTableColumn<ReportRow>[] = [
  {
    key: "reference",
    header: "Reference",
    render: (row) => <span className="font-mono text-xs text-ink">{row.id}</span>,
  },
  {
    key: "category",
    header: "Category",
    render: (row) => <span className="font-medium text-ink">{row.category}</span>,
  },
  {
    key: "location",
    header: "Location",
    className: "hidden md:table-cell",
    render: (row) => <span className="text-ink/60">{row.location}</span>,
  },
  {
    key: "submitted",
    header: "Submitted",
    render: (row) => <span className="font-mono text-xs text-ink/50">{row.submitted}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusPill status={row.status} />,
  },
];

export default function CitizenMyReportsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");

  const filtered = filter === "ALL" ? reports : reports.filter((row) => row.status === filter);

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-ink">My Reports</h1>
        <p className="mt-2 font-body text-ink/60">
          The full history of everything you&apos;ve reported to the city.
        </p>
      </div>

      <div role="tablist" aria-label="Filter reports by status" className="flex gap-1">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-xs border px-3 py-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.05em] transition-colors",
              filter === value
                ? "border-ledger bg-ledger text-paper"
                : "border-line bg-paper text-ink/50 hover:border-ink/40 hover:text-ink",
            )}
          >
            {value.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="rounded-xs border border-line bg-paper px-4 py-2 sm:px-6">
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
          emptyTitle={
            filter === "ALL" ? "Nothing here yet" : `No ${filter.replace("_", " ")} reports`
          }
          emptyBody="New reports you submit will appear here, along with their status as the city works on them."
        />
      </div>
    </div>
  );
}
