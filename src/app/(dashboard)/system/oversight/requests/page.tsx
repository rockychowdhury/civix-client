import { Suspense } from "react";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { OversightRequestsView } from "@/components/modules/admin/views/OversightViews";

export const dynamic = "force-static";

export const metadata = { title: "Service Requests — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      <Suspense fallback={<AdminSectionSkeleton />}>
        <OversightRequestsView />
      </Suspense>
    </div>
  );
}
