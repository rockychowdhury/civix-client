import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { MunicipalitiesView } from "@/components/modules/admin/views/MunicipalitiesView";

export const dynamic = "force-static";

export const metadata = { title: "Municipalities — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Municipalities"
        description="Onboard tenants, inspect a single municipality, and manage its lifecycle."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <MunicipalitiesView />
      </Suspense>
    </div>
  );
}
