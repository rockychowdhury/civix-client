import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { StaffDetailView } from "@/components/modules/admin/views/StaffDetailView";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export const metadata = { title: "Staff detail — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Staff detail" description="Designation, department, and status." />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <StaffDetailView />
      </Suspense>
    </div>
  );
}
