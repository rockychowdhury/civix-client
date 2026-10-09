import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { CityScopeGate, CityStaffView } from "@/components/modules/city";

export const dynamic = "force-static";

export const metadata = { title: "Staff — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Staff"
        description="Hire managers, dispatchers, and technicians across your departments."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <CityScopeGate>
          <CityStaffView />
        </CityScopeGate>
      </Suspense>
    </div>
  );
}
