import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { WardsView } from "@/components/modules/admin/views/WardsView";

export const dynamic = "force-static";

export const metadata = { title: "Wards — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Wards"
        description="Street-level jurisdiction with department coverage per ward."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <WardsView />
      </Suspense>
    </div>
  );
}
