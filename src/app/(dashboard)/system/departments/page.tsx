import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { DepartmentsView } from "@/components/modules/admin/views/DepartmentsView";

export const dynamic = "force-static";

export const metadata = { title: "Departments — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Departments"
        description="Own the service catalogue and ward coverage for every department."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <DepartmentsView />
      </Suspense>
    </div>
  );
}
