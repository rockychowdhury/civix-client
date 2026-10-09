import { Suspense } from "react";
import { CitizenMyReportsView } from "@/components/modules/citizen";

export const dynamic = "force-static";

export const metadata = {
  title: "My Reports | Citizen Portal",
  description: "View and track the status of all your submitted service requests.",
};

export default function CitizenMyReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
          Loading your service requests...
        </div>
      }
    >
      <CitizenMyReportsView />
    </Suspense>
  );
}
