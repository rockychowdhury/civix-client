import { Skeleton } from "@/components/ui/skeleton";

/** SSG-friendly Suspense fallback — mirrors the island layout, no data fetch. */
export function AdminSectionSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-busy="true"
      aria-label="Loading section"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 bg-field" />
        <Skeleton className="h-4 w-96 max-w-full bg-field/60" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-12 w-full bg-field/50" />
        <Skeleton className="h-12 w-full bg-field/50" />
        <Skeleton className="h-12 w-full bg-field/50" />
      </div>
    </div>
  );
}
