import { Suspense } from "react";
import { MyWorkView } from "@/components/modules/technician";

export const dynamic = "force-static";

export const metadata = {
  title: "Assigned Work Orders | Technician Operations",
  description: "View and execute assigned field work orders.",
};

export default function TechnicianWorkOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
          Loading work orders...
        </div>
      }
    >
      <MyWorkView />
    </Suspense>
  );
}
