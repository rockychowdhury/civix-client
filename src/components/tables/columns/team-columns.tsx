import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { ITeam } from "@/types";
import { TeamRowActions } from "./team-row-actions";

export const teamColumns: ColumnDef<ITeam>[] = [
  {
    accessorKey: "code",
    header: "Team Code",
    cell: ({ row }) => {
      return (
        <span className="font-mono text-sm font-medium text-ink bg-field px-2 py-1 rounded-md">
          {row.original.code}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <span className="font-medium text-ink">
          {row.original.name}
        </span>
      );
    },
  },
  {
    accessorKey: "leader",
    header: "Leader",
    cell: ({ row }) => {
      const leader = row.original.leader;
      if (!leader) return <span className="text-ink/40 text-sm">No Leader</span>;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-ink text-sm">
            {leader.firstName} {leader.lastName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "members",
    header: "Members",
    cell: ({ row }) => {
      const membersCount = row.original.members?.length || 0;
      return (
        <span className="text-sm text-ink/80">
          {membersCount} {membersCount === 1 ? "member" : "members"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "UNKNOWN";
      let colorClass = "bg-line/20 text-ink/70";
      if (status === "ACTIVE") colorClass = "bg-signal-resolved/20 text-signal-resolved border-signal-resolved/30";
      if (status === "INACTIVE") colorClass = "bg-signal-progress/20 text-signal-progress border-signal-progress/30";
      if (status === "DISBANDED") colorClass = "bg-signal-open/20 text-signal-open border-signal-open/30";
      
      return (
        <Badge variant="outline" className={`capitalize font-medium rounded-full ${colorClass}`}>
          {status.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <TeamRowActions row={row} />,
  },
];
