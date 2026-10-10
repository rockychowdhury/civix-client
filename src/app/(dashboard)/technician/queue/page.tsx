import { Suspense } from "react";
import { MyWorkView } from "@/components/modules/technician";

export const dynamic = "force-static";

export const metadata = {
  title: "Field Queue | Technician Operations",
  description: "Accepted and active field work orders queue.",
};

export default function TechnicianQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
          Loading your work...
        </div>
      }
    >
      <MyWorkView />
    </Suspense>
  );
}
