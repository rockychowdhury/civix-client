import { Suspense } from "react";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { DepartmentsView } from "@/components/modules/admin/views/DepartmentsView";

export const dynamic = "force-static";

export const metadata = { title: "Departments — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      <Suspense fallback={<AdminSectionSkeleton />}>
        <DepartmentsView />
      </Suspense>
    </div>
  );
}
