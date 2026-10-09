import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { CityIssuesView, CityScopeGate } from "@/components/modules/city";

export const dynamic = "force-static";

export const metadata = { title: "Issues — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Civic issues"
        description="Every consolidated issue in your city — inspect, override, or reopen."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <CityScopeGate>
          <CityIssuesView />
        </CityScopeGate>
      </Suspense>
    </div>
  );
}
