import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { AnalyticsOverviewView } from "@/components/modules/admin/views/AnalyticsOverviewView";

export const dynamic = "force-static";

export const metadata = { title: "Overview — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Platform overview"
        description="Cross-municipality health at a glance. Breakdowns stay collapsed until you need them."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <AnalyticsOverviewView />
      </Suspense>
    </div>
  );
}
