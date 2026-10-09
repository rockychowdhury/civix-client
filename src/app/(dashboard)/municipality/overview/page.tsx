import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { CityOverviewView, CityScopeGate } from "@/components/modules/city";

export const dynamic = "force-static";

export const metadata = { title: "Overview — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="City overview"
        description="Your municipality at a glance — profile, live load, and where it sits."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <CityScopeGate>
          <CityOverviewView />
        </CityScopeGate>
      </Suspense>
    </div>
  );
}
