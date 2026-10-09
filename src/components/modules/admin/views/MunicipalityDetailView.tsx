"use client";

import { useParams } from "next/navigation";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { AdminSectionSkeleton, StatusBadge } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { useGetMunicipalityById } from "@/hooks";

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1 border-t border-line/25 py-3 first:border-t-0 first:pt-0">
      <dt className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/50">{label}</dt>
      <dd className="font-body text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

export function MunicipalityDetailView() {
  const params = useParams<{ municipalityId: string }>();
  const query = useGetMunicipalityById(params.municipalityId);

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError || query.data?.data == null) {
    return (
      <EmptyState
        title="Municipality not found"
        body="This tenant could not be loaded. It may have been removed."
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

  const row = query.data.data;
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-medium text-ink">{row.name}</h2>
        <StatusBadge status={row.coverageStatus} />
      </div>
      <dl className="flex flex-col">
        <DetailRow label="Code" value={row.code} />
        <DetailRow label="Country" value={row.countryCode} />
        <DetailRow label="Timezone" value={row.timezone} />
      </dl>
    </div>
  );
}
