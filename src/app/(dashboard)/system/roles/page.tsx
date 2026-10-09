import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { RolesView } from "@/components/modules/admin/views/RolesView";

export const dynamic = "force-static";

export const metadata = { title: "Roles — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Roles & access"
        description="Define roles, shape the permission matrix, and assign people."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <RolesView />
      </Suspense>
    </div>
  );
}
