import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { ZonesView } from "@/components/modules/admin/views/ZonesView";
import { CityScopeGate } from "@/components/modules/city";

export const dynamic = "force-static";

export const metadata = { title: "Zones — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Zones"
        description="Administrative boundaries of your city. Drill into a zone for its wards."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <CityScopeGate>
          <ZonesView />
        </CityScopeGate>
      </Suspense>
    </div>
  );
}
