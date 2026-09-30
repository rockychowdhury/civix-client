import { DataTable, type DataTableColumn } from "@/components/modules/dashboard/DataTable";
import { PriorityBadge } from "@/components/modules/dashboard/PriorityBadge";
import { SLACountdown } from "@/components/modules/dashboard/SLACountdown";
import { StatusPill } from "@/components/modules/dashboard/StatusPill";

type WorkOrderRow = {
  id: string;
  title: string;
  location: string;
  priority: string;
  status: string;
  minutesToSla: number;
};

const workOrders: WorkOrderRow[] = [
  {
    id: "WO-4821",
    title: "Water mains leak on Mazar Rd",
    location: "23 Mazar Road",
    priority: "CRITICAL",
    status: "ASSIGNED",
    minutesToSla: -18,
  },
  {
    id: "WO-4819",
    title: "Flooded underpass drains",
    location: "Station Underpass",
    priority: "HIGH",
    status: "IN_PROGRESS",
    minutesToSla: 45,
  },
  {
    id: "WO-4815",
    title: "Open manhole on Ring Road",
    location: "Ring Road",
    priority: "HIGH",
    status: "ASSIGNED",
    minutesToSla: 96,
  },
  {
    id: "WO-4810",
    title: "Streetlight cluster outage",
    location: "College Road",
    priority: "MEDIUM",
    status: "ASSIGNED",
    minutesToSla: 225,
  },
  {
    id: "WO-4806",
    title: "Blocked storm drain",
    location: "Park Side",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    minutesToSla: 330,
  },
  {
    id: "WO-4802",
    title: "Paving issue on Old Quarter",
    location: "Old Quarter",
    priority: "LOW",
    status: "ASSIGNED",
    minutesToSla: 780,
  },
];

const columns: DataTableColumn<WorkOrderRow>[] = [
  {
    key: "workorder",
    header: "Work order",
    render: (row) => (
      <div className="space-y-0.5">
        <p className="font-medium text-ink">{row.title}</p>
        <p className="font-mono text-xs text-ink/45">{row.id}</p>
      </div>
    ),
  },
  {
    key: "location",
    header: "Location",
    className: "hidden sm:table-cell",
    render: (row) => <span className="text-ink/60">{row.location}</span>,
  },
  {
    key: "priority",
    header: "Priority",
    render: (row) => <PriorityBadge priority={row.priority} />,
  },
  {
    key: "status",
    header: "Status",
    className: "hidden sm:table-cell",
    render: (row) => <StatusPill status={row.status} />,
  },
  {
    key: "sla",
    header: "SLA",
    align: "right",
    render: (row) => <SLACountdown minutesLeft={row.minutesToSla} />,
  },
];

export default function TechnicianQueuePage() {
  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink">Today&apos;s Queue</h1>
          <p className="mt-2 font-body text-ink/60">
            Assigned work orders, sorted by priority and how close each is to its SLA.
          </p>
        </div>
        <span className="font-mono text-sm tabular-nums text-ledger">
          {workOrders.length} assigned
        </span>
      </div>

      <div className="rounded-xs border border-line bg-paper px-4 py-2 sm:px-6">
        <DataTable
          columns={columns}
          rows={workOrders}
          rowKey={(row) => row.id}
          emptyTitle="Queue is clear"
          emptyBody="No assigned work orders right now. You'll see new ones here the moment they're dispatched to you."
        />
      </div>
    </div>
  );
}
