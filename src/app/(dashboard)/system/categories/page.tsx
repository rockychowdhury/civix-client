import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { CategoriesView } from "@/components/modules/admin/views/CategoriesView";

export const dynamic = "force-static";

export const metadata = { title: "Categories — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Categories"
        description="Root causes and subcategories that drive routing."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <CategoriesView />
      </Suspense>
    </div>
  );
}
