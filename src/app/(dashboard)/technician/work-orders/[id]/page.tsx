import { Suspense } from "react";
import { WorkExecutionView } from "@/components/modules/technician";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export const metadata = {
  title: "Work Order Execution | Technician Operations",
  description: "Field job execution, site updates logging, and repair resolution.",
};

export default function TechnicianWorkOrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
          Loading job details...
        </div>
      }
    >
      <WorkExecutionView />
    </Suspense>
  );
}
