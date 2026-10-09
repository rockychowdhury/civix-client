import { Suspense } from "react";
import { AdminPageHeader, AdminSectionSkeleton } from "@/components/modules/admin";
import { UserDetailView } from "@/components/modules/admin/views/UserDetailView";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export const metadata = { title: "User detail — Civix" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="User detail" description="Profile, roles, and moderation history." />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <UserDetailView />
      </Suspense>
    </div>
  );
}
