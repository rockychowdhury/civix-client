import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { TeamsView } from "@/components/modules/admin/views/TeamsView";

export const dynamic = "force-static";

export const metadata = { title: "Teams — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Teams" description="Field crews grouped under each department." />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <TeamsView />
      </Suspense>
    </div>
  );
}
