import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { OversightFeedbackView } from "@/components/modules/admin/views/OversightViews";

export const dynamic = "force-static";

export const metadata = { title: "Feedback oversight — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Feedback" description="Satisfaction signals across the platform." />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <OversightFeedbackView />
      </Suspense>
    </div>
  );
}
