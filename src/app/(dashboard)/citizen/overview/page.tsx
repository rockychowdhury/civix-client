import { Suspense } from "react";
import { CitizenOverviewView } from "@/components/modules/citizen";

export const dynamic = "force-static";

export const metadata = {
  title: "Overview | Citizen Portal",
  description: "Monitor and manage your submitted civic issue reports.",
};

export default function CitizenOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
          Loading citizen dashboard...
        </div>
      }
    >
      <CitizenOverviewView />
    </Suspense>
  );
}
