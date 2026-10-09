import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { UsersView } from "@/components/modules/admin/views/UsersView";

export const dynamic = "force-static";

export const metadata = { title: "Users — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Users"
        description="Moderate platform accounts — suspend, restore, or remove. Filters read from the URL so the shell stays static."
      />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <UsersView />
      </Suspense>
    </div>
  );
}
