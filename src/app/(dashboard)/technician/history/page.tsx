import { Suspense } from "react";
import { HistoryView } from "@/components/modules/technician";

export const dynamic = "force-static";

export const metadata = {
  title: "Resolution History | Technician Operations",
  description: "Historical archive of completed and verified field work orders.",
};

export default function TechnicianHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
          Loading history...
        </div>
      }
    >
      <HistoryView />
    </Suspense>
  );
}
