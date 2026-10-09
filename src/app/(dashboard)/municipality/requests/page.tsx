import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { CityRequestsView, CityScopeGate } from "@/components/modules/city";

export const dynamic = "force-static";

export const metadata = { title: "Service requests — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Service requests"
        description="Every citizen-submitted request in your city."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <CityScopeGate>
          <CityRequestsView />
        </CityScopeGate>
      </Suspense>
    </div>
  );
}
