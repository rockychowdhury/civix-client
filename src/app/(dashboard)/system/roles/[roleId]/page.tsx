import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { RoleDetailView } from "@/components/modules/admin/views/RoleDetailView";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export const metadata = { title: "Role detail — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Role detail" description="Metadata and assigned permissions." />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <RoleDetailView />
      </Suspense>
    </div>
  );
}
