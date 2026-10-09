import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { CategoriesView } from "@/components/modules/admin/views/CategoriesView";
import { CityScopeGate } from "@/components/modules/city";

export const dynamic = "force-static";

export const metadata = { title: "Categories — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Categories"
        description="Service types and routing for your departments."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <CityScopeGate>
          <CategoriesView />
        </CityScopeGate>
      </Suspense>
    </div>
  );
}
