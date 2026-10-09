import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { ZonesView } from "@/components/modules/admin/views/ZonesView";

export const dynamic = "force-static";

export const metadata = { title: "Zones — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Zones"
        description="Top-level jurisdiction blocks. Drill into a zone for its wards."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <ZonesView />
      </Suspense>
    </div>
  );
}
