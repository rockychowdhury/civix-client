import { Suspense } from "react";
import { MyWorkView } from "@/components/modules/technician";

export const dynamic = "force-static";

export const metadata = {
  title: "My Work | Technician Dashboard",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-ink">My Work</h1>
        <p className="font-body text-sm text-ink/60">
          Accepted jobs — open one to log progress and resolve it.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
            Loading your work...
          </div>
        }
      >
        <MyWorkView />
      </Suspense>
    </div>
  );
}
