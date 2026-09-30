"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/modules/dashboard/DataTable";
import { PriorityBadge } from "@/components/modules/dashboard/PriorityBadge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type WorkOrderRow = {
  id: string;
  title: string;
  priority: string;
  technician: string | null;
};

const technicians = ["Meera N.", "Arjun K.", "Sana F.", "David O.", "Kofi A."];

const initialOrders: WorkOrderRow[] = [
  { id: "WO-4823", title: "Cracked road section – MG Rd", priority: "HIGH", technician: null },
  {
    id: "WO-4822",
    title: "Blocked culvert – North Side",
    priority: "HIGH",
    technician: "Meera N.",
  },
  { id: "WO-4820", title: "Fence collapse – Playfield", priority: "MEDIUM", technician: null },
  { id: "WO-4817", title: "Drain cover replacement", priority: "HIGH", technician: "Arjun K." },
  { id: "WO-4814", title: "Footpath repairs – Market St", priority: "LOW", technician: null },
];

function AssignTechnician({
  id,
  current,
  triggerLabel,
  onChoose,
}: {
  id: string;
  current: string | null;
  triggerLabel?: string;
  onChoose: (technician: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={current ? "secondary" : "primary"}
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label={`Assign work order ${id}`}
          className="justify-between gap-2"
        >
          {triggerLabel ?? current}
          <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Search technicians" />
          <CommandList>
            <CommandEmpty>No technician found.</CommandEmpty>
            <CommandGroup heading="Available">
              {technicians.map((technician) => {
                const selected = current === technician;
                return (
                  <CommandItem
                    key={technician}
                    value={technician}
                    onSelect={() => {
                      onChoose(technician);
                      setOpen(false);
                    }}
                  >
                    <span className="flex-1">{technician}</span>
                    {selected && <Check className="size-3.5 text-ledger" aria-hidden="true" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function DepartmentWorkOrdersPage() {
  const [orders, setOrders] = useState(initialOrders);

  const assign = (id: string, technician: string) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, technician } : order)));
    toast.success("Dispatched", {
      description: `WO-${id} assigned to ${technician}.`,
    });
  };

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
      key: "priority",
      header: "Priority",
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      key: "technician",
      header: "Assigned technician",
      render: (row) =>
        row.technician ? (
          <AssignTechnician
            id={row.id}
            current={row.technician}
            onChoose={(technician) => assign(row.id, technician)}
          />
        ) : (
          <span className="font-body text-sm text-ink/40">Unassigned</span>
        ),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (row) => (
        <AssignTechnician
          id={row.id}
          current={row.technician}
          triggerLabel={row.technician ? "Reassign" : "Assign"}
          onChoose={(technician) => assign(row.id, technician)}
        />
      ),
    },
  ];

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink">Work Orders</h1>
          <p className="mt-2 font-body text-ink/60">
            Dispatch incoming work to your field technicians.
          </p>
        </div>
        <span className="font-mono text-sm tabular-nums text-ink/50">
          {orders.filter((order) => !order.technician).length} awaiting dispatch
        </span>
      </div>

      <div className="rounded-xs border border-line bg-paper px-4 py-2 sm:px-6">
        <DataTable
          columns={columns}
          rows={orders}
          rowKey={(row) => row.id}
          emptyTitle="No work orders"
          emptyBody="New work orders will appear here as they come in from the council."
        />
      </div>
    </div>
  );
}
