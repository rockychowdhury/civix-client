import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { PermissionsView } from "@/components/modules/admin/views/PermissionsView";

export const dynamic = "force-static";

export const metadata = { title: "Permissions — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Permissions"
        description="Every capability in the system, grouped for the matrix editor."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <PermissionsView />
      </Suspense>
    </div>
  );
}
