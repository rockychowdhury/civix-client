import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { SlaPoliciesView } from "@/components/modules/admin/views/SlaPoliciesView";
import { CityScopeGate } from "@/components/modules/city";

export const dynamic = "force-static";

export const metadata = { title: "SLA Policies — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="SLA policies"
        description="Response and resolution targets for your city."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <CityScopeGate>
          <SlaPoliciesView />
        </CityScopeGate>
      </Suspense>
    </div>
  );
}
