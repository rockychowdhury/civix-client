import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { OversightIssuesView } from "@/components/modules/admin/views/OversightIssuesView";

export const dynamic = "force-static";

export const metadata = { title: "Issue oversight — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Civic issues"
        description="Inspect any report and override its status when the city needs to intervene."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <OversightIssuesView />
      </Suspense>
    </div>
  );
}
