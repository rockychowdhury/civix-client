import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { StaffView } from "@/components/modules/admin/views/StaffView";

export const dynamic = "force-static";

export const metadata = { title: "Staff — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Staff"
        description="Provision platform admins, city admins, managers, dispatchers, and technicians."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <StaffView />
      </Suspense>
    </div>
  );
}
