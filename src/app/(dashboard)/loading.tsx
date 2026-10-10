import { AdminSectionSkeleton } from "@/components/modules/admin";

/**
 * Route-segment loader for dashboard navigations. The static shell swaps
 * instantly; dynamic islands show their own skeletons once mounted.
 */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      <AdminSectionSkeleton />
    </div>
  );
}
