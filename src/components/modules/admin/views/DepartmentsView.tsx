"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/layout/dashboard/DataTable";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import {
  AdminFormDialog,
  type AdminFormField,
  AdminSectionSkeleton,
  AdminToolbar,
  StatusBadge,
} from "@/components/modules/admin";
import { useAdminListParams } from "@/components/modules/admin/views/useAdminListParams";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAttachDepartmentServiceAreas,
  useCreateDepartment,
  useGetAdminWards,
  useGetDepartments,
  useUpdateDepartment,
} from "@/hooks";
import { departmentFormSchema } from "@/validation";

interface DepartmentRow {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string;
  municipality?: { name?: string };
}

const FIELDS: AdminFormField[] = [
  { name: "name", label: "Name", type: "text", placeholder: "e.g. Waste Management" },
  { name: "code", label: "Code", type: "text", placeholder: "e.g. WASTE" },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "What does it own?",
    optional: true,
  },
  { name: "email", label: "Email", type: "text", placeholder: "dept@example.com", optional: true },
  { name: "phone", label: "Phone", type: "text", placeholder: "01XXXXXXXXX", optional: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    optional: true,
    options: [
      { value: "ACTIVE", label: "ACTIVE" },
      { value: "INACTIVE", label: "INACTIVE" },
    ],
  },
];

export function DepartmentsView({ municipalityId }: { municipalityId?: string } = {}) {
  const { search, setSearch, debouncedSearch } = useAdminListParams(municipalityId);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; row?: DepartmentRow } | null>(
    null,
  );
  const [attachFor, setAttachFor] = useState<DepartmentRow | null>(null);
  const [pickedWards, setPickedWards] = useState<string[]>([]);

  const query = useGetDepartments(municipalityId ? { municipalityId } : undefined);
  const wardsQuery = useGetAdminWards(
    municipalityId ? { municipalityId, limit: 100 } : { limit: 100 },
  );
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const attachMutation = useAttachDepartmentServiceAreas();

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Departments unavailable"
        body="Departments could not be loaded. Check your connection and try again."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => query.refetch()}
            className="cursor-pointer"
          >
            Retry
          </Button>
        }
      />
    );
  }

  const term = debouncedSearch.trim().toLowerCase();
  const rows: DepartmentRow[] = (query.data?.data ?? []).filter((d: DepartmentRow) =>
    term ? `${d.name} ${d.code}`.toLowerCase().includes(term) : true,
  );
  const wards = wardsQuery.data?.data ?? [];

  const toggleWard = (id: string) =>
    setPickedWards((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="flex flex-col gap-5">
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments…"
        resultCount={rows.length}
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setDialog({ mode: "create" })}
            className="cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create department
          </Button>
        }
      />

      <DataTable<DepartmentRow>
        columns={[
          {
            key: "dept",
            header: "Department",
            render: (row) => (
              <div className="flex flex-col">
                <span className="font-medium text-ink">{row.name}</span>
                <span className="font-mono text-xs text-ink/50">
                  {row.code}
                  {row.municipality?.name ? ` · ${row.municipality.name}` : ""}
                </span>
              </div>
            ),
          },
          {
            key: "contact",
            header: "Contact",
            render: (row) => (
              <span className="font-body text-sm text-ink/70">{row.email || row.phone || "—"}</span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />,
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (row) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="secondary" size="sm" className="cursor-pointer">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setDialog({ mode: "edit", row })}
                    className="cursor-pointer"
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setPickedWards([]);
                      setAttachFor(row);
                    }}
                    className="cursor-pointer"
                  >
                    Attach service areas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="No departments yet"
        emptyBody="Departments with their service-area mappings will appear here."
      />

      <AdminFormDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title={dialog?.mode === "edit" ? "Edit department" : "Create department"}
        fields={FIELDS}
        schema={departmentFormSchema}
        defaultValues={
          dialog?.mode === "edit" && dialog.row
            ? {
                name: dialog.row.name,
                code: dialog.row.code,
                description: dialog.row.description ?? "",
                email: dialog.row.email ?? "",
                phone: dialog.row.phone ?? "",
                status: dialog.row.status ?? "",
              }
            : { name: "", code: "", description: "", email: "", phone: "", status: "" }
        }
        submitLabel={dialog?.mode === "edit" ? "Save changes" : "Create"}
        pending={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          const payload = Object.fromEntries(
            Object.entries(values).filter(([, v]) => v !== ""),
          ) as Record<string, unknown>;
          if (dialog?.mode === "edit" && dialog.row) {
            updateMutation.mutate(
              { id: dialog.row.id, payload },
              { onSuccess: () => setDialog(null) },
            );
          } else {
            createMutation.mutate(
              municipalityId ? { ...payload, municipalityId } : payload,
              { onSuccess: () => setDialog(null) },
            );
          }
        }}
      />

      <Dialog
        open={attachFor !== null}
        onOpenChange={(open) => {
          if (!open) setAttachFor(null);
        }}
      >
        <DialogContent
          className="border-line bg-paper text-ink sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-ink">Attach service areas</DialogTitle>
            <DialogDescription className="font-body leading-relaxed text-ink/65">
              Wards covered by {attachFor?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {wardsQuery.isLoading ? (
              <p className="font-body text-sm text-ink/55">Loading wards…</p>
            ) : (
              wards.map((ward) => (
                <label
                  key={ward.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xs px-2 py-2 transition-colors hover:bg-field/50"
                >
                  <input
                    type="checkbox"
                    checked={pickedWards.includes(ward.id)}
                    onChange={() => toggleWard(ward.id)}
                    aria-label={ward.name}
                    className="size-4 shrink-0 cursor-pointer accent-ledger"
                  />
                  <span className="font-body text-sm text-ink">
                    {ward.name}
                    <span className="ml-2 font-mono text-xs text-ink/50">#{ward.number}</span>
                  </span>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setAttachFor(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={pickedWards.length === 0 || attachMutation.isPending}
              loading={attachMutation.isPending}
              loadingText="Attaching…"
              onClick={() => {
                if (attachFor) {
                  attachMutation.mutate(
                    { id: attachFor.id, payload: { wardIds: pickedWards } },
                    { onSuccess: () => setAttachFor(null) },
                  );
                }
              }}
              className="cursor-pointer"
            >
              Attach {pickedWards.length > 0 ? `(${pickedWards.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
