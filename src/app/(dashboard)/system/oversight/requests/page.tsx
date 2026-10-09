import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { OversightRequestsView } from "@/components/modules/admin/views/OversightViews";

export const dynamic = "force-static";

export const metadata = { title: "Request oversight — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Service requests" description="Every citizen request, one queue." />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <OversightRequestsView />
      </Suspense>
    </div>
  );
}
