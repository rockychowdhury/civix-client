import { DataTable, type DataTableColumn } from "@/components/modules/dashboard/DataTable";
import { StatusPill } from "@/components/modules/dashboard/StatusPill";

type HistoryRow = {
  id: string;
  title: string;
  location: string;
  completed: string;
  status: string;
};

const history: HistoryRow[] = [
  {
    id: "WO-4798",
    title: "Water mains leak on Mazar Rd",
    location: "23 Mazar Road",
    completed: "Sep 21",
    status: "RESOLVED",
  },
  {
    id: "WO-4791",
    title: "Pothole at St. Anne's Junction",
    location: "St. Anne's Junction",
    completed: "Sep 19",
    status: "RESOLVED",
  },
  {
    id: "WO-4785",
    title: "Faulty traffic signal",
    location: "Ring Road",
    completed: "Sep 17",
    status: "RESOLVED",
  },
  {
    id: "WO-4772",
    title: "Blocked storm drain",
    location: "Park Side",
    completed: "Sep 14",
    status: "RESOLVED",
  },
  {
    id: "WO-4760",
    title: "Streetlight outage",
    location: "College Road",
    completed: "Sep 11",
    status: "RESOLVED",
  },
];

const columns: DataTableColumn<HistoryRow>[] = [
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
    key: "completed",
    header: "Completed",
    render: (row) => <span className="font-mono text-xs text-ink/50">{row.completed}</span>,
  },
  {
    key: "status",
    header: "Status",
    align: "right",
    render: (row) => <StatusPill status={row.status} />,
  },
];

export default function TechnicianHistoryPage() {
  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-ink">Completed</h1>
        <p className="mt-2 font-body text-ink/60">
          Your resolved work orders, for reference and record.
        </p>
      </div>

      <div className="rounded-xs border border-line bg-paper px-4 py-2 sm:px-6">
        <DataTable
          columns={columns}
          rows={history}
          rowKey={(row) => row.id}
          emptyTitle="No completed work yet"
          emptyBody="Work orders you resolve will be logged here automatically."
        />
      </div>
    </div>
  );
}
