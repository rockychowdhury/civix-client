import { Suspense } from "react";
import { TechnicianOverviewView } from "@/components/modules/technician";

export const dynamic = "force-static";

export const metadata = {
  title: "Technician Command Overview | Civix",
  description: "Operational overview of field shifts, workload capacity, and work order queues.",
};

export default function TechnicianOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
          Loading technician overview...
        </div>
      }
    >
      <TechnicianOverviewView />
    </Suspense>
  );
}
