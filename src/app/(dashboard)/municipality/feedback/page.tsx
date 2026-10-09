import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { CityFeedbackView, CityScopeGate } from "@/components/modules/city";

export const dynamic = "force-static";

export const metadata = { title: "Feedback — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Citizen feedback"
        description="Satisfaction and quality signals across your city."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <CityScopeGate>
          <CityFeedbackView />
        </CityScopeGate>
      </Suspense>
    </div>
  );
}
