import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { MunicipalityDetailView } from "@/components/modules/admin/views/MunicipalityDetailView";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export const metadata = { title: "Municipality detail — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Municipality detail"
        description="Settings, status, and lifecycle for a single tenant."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <MunicipalityDetailView />
      </Suspense>
    </div>
  );
}
