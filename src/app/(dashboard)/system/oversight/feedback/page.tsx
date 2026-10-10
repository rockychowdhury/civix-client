import { Suspense } from "react";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { OversightFeedbackView } from "@/components/modules/admin/views/OversightViews";

export const dynamic = "force-static";

export const metadata = { title: "Feedback — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      <Suspense fallback={<AdminSectionSkeleton />}>
        <OversightFeedbackView />
      </Suspense>
    </div>
  );
}
