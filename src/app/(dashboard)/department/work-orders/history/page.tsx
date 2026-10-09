import { Suspense } from "react";
import { WorkOrderHistoryClient } from "./WorkOrderHistoryClient";

export const metadata = {
  title: "Work Order History | Civix",
  description: "View the full lifecycle and history of a work order",
};

export default function WorkOrderHistoryPage() {
  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] w-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full text-ink/40">
            Loading history...
          </div>
        }
      >
        <WorkOrderHistoryClient />
      </Suspense>
    </div>
  );
}
