"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/layout/dashboard/DataTable";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import {
  AdminConfirmDialog,
  AdminFormDialog,
  type AdminFormField,
  AdminPagination,
  AdminSectionSkeleton,
  AdminToolbar,
} from "@/components/modules/admin";
import { useAdminListParams } from "@/components/modules/admin/views/useAdminListParams";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  useCreateCategory,
  useDeleteCategory,
  useGetAdminCategories,
  useGetCategoryChildren,
  useUpdateCategory,
} from "@/hooks";
import { useGetDepartments } from "@/hooks/department.hook";
import type { Category } from "@/types";
import { categoryFormSchema } from "@/validation";

export function CategoriesView() {
  const { search, setSearch, debouncedSearch, page, setPage, limit } = useAdminListParams();
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; row?: Category } | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [childrenFor, setChildrenFor] = useState<Category | null>(null);

  const query = useGetAdminCategories({
    searchTerm: debouncedSearch || undefined,
    page,
    limit,
  });
  const departmentsQuery = useGetDepartments();
  const childrenQuery = useGetCategoryChildren(childrenFor?.id ?? "");
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Categories unavailable"
        body="Categories could not be loaded. Check your connection and try again."
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

  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;
  const departments = departmentsQuery.data?.data ?? [];
  const roots = query.data ? rows.filter((c) => c.parentId == null) : rows;

  const FIELDS: AdminFormField[] = [
    { name: "name", label: "Name", type: "text", placeholder: "e.g. Pothole" },
    { name: "slug", label: "Slug", type: "text", placeholder: "e.g. pothole", optional: true },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "What counts as this?",
      optional: true,
    },
    {
      name: "departmentId",
      label: "Department",
      type: "select",
      optional: true,
      options: departments.map((d: { id: string; name: string }) => ({
        value: d.id,
        label: d.name,
      })),
    },
    {
      name: "parentId",
      label: "Parent category",
      type: "select",
      optional: true,
      options: roots
        .filter((c) => c.id !== dialog?.row?.id)
        .map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "baseSeverity", label: "Base severity (1–5)", type: "number", optional: true },
    { name: "sortOrder", label: "Sort order", type: "number", optional: true },
    { name: "isActive", label: "Active", type: "switch" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories…"
        resultCount={meta?.total}
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setDialog({ mode: "create" })}
            className="cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create category
          </Button>
        }
      />

      <DataTable<Category>
        columns={[
          {
            key: "category",
            header: "Category",
            render: (row) => (
              <div className="flex flex-col">
                <span className="font-medium text-ink">{row.name}</span>
                <span className="font-mono text-xs text-ink/50">
                  {row.slug}
                  {row.department ? ` · ${row.department.name}` : ""}
                </span>
              </div>
            ),
          },
          {
            key: "severity",
            header: "Severity",
            align: "right",
            render: (row) => (
              <span className="font-mono text-xs text-ink/70">{row.baseSeverity}</span>
            ),
          },
          {
            key: "active",
            header: "Active",
            render: (row) => (
              <Switch
                checked={row.isActive}
                onCheckedChange={(checked) =>
                  updateMutation.mutate({ id: row.id, payload: { isActive: checked } })
                }
                aria-label={`${row.name} active`}
                className="cursor-pointer"
              />
            ),
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
                  <DropdownMenuItem onClick={() => setChildrenFor(row)} className="cursor-pointer">
                    View children
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDialog({ mode: "edit", row })}
                    className="cursor-pointer"
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleting(row)}
                    className="cursor-pointer text-signal-open focus:text-signal-open"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="No categories yet"
        emptyBody="Root and child categories will appear here."
      />
      <AdminPagination meta={meta} onPageChange={setPage} />

      {childrenFor ? (
        <div className="flex flex-col gap-2 border-t border-line/25 pt-4">
          <h3 className="font-display text-base font-medium text-ink">
            Children of {childrenFor.name}
          </h3>
          {childrenQuery.isLoading ? (
            <p className="font-body text-sm text-ink/55">Loading children…</p>
          ) : (
            <p className="font-body text-sm text-ink/65">
              {((childrenQuery.data?.data ?? []) as Category[]).length > 0
                ? ((childrenQuery.data?.data ?? []) as Category[]).map((c) => c.name).join(", ")
                : "No child categories."}{" "}
              <button
                type="button"
                onClick={() => setChildrenFor(null)}
                className="cursor-pointer underline underline-offset-2"
              >
                Hide
              </button>
            </p>
          )}
        </div>
      ) : null}

      <AdminFormDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title={dialog?.mode === "edit" ? "Edit category" : "Create category"}
        fields={FIELDS}
        schema={categoryFormSchema}
        defaultValues={
          dialog?.mode === "edit" && dialog.row
            ? {
                name: dialog.row.name,
                slug: dialog.row.slug,
                description: dialog.row.description ?? "",
                departmentId: dialog.row.departmentId,
                parentId: dialog.row.parentId ?? "",
                baseSeverity: dialog.row.baseSeverity,
                sortOrder: dialog.row.sortOrder,
                isActive: dialog.row.isActive,
              }
            : {
                name: "",
                slug: "",
                description: "",
                departmentId: "",
                parentId: "",
                isActive: true,
              }
        }
        submitLabel={dialog?.mode === "edit" ? "Save changes" : "Create"}
        pending={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          const payload = Object.fromEntries(
            Object.entries(values).filter(
              ([, v]) => v !== "" && v !== undefined && !Number.isNaN(v),
            ),
          );
          if (dialog?.mode === "edit" && dialog.row) {
            updateMutation.mutate(
              { id: dialog.row.id, payload },
              { onSuccess: () => setDialog(null) },
            );
          } else {
            createMutation.mutate(payload as never, { onSuccess: () => setDialog(null) });
          }
        }}
      />

      <AdminConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete category"
        body={`"${deleting?.name}" will be permanently deleted.`}
        confirmLabel="Delete"
        pending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) {
            deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
          }
        }}
      />
    </div>
  );
}
