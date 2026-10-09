import { Suspense } from "react";
import { HistoryView } from "@/components/modules/technician";

export const dynamic = "force-static";

export const metadata = {
  title: "History | Technician Dashboard",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-ink">History</h1>
        <p className="font-body text-sm text-ink/60">Resolved, verified, and rejected jobs.</p>
      </div>
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
            Loading history...
          </div>
        }
      >
        <HistoryView />
      </Suspense>
    </div>
  );
}
