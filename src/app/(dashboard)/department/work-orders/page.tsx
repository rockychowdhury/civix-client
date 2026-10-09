import { Suspense } from "react";
import { WorkOrdersClient } from "./WorkOrdersClient";

export const metadata = {
  title: "Work Orders | Civix",
  description: "Manage departmental work orders and dispatch technicians",
};

export default function WorkOrdersPage() {
  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full px-6 md:px-12 pt-8 pb-24">
      <div className="flex-1 w-full flex flex-col animate-slide-up">
        <Suspense
          fallback={
            <div className="h-96 flex items-center justify-center text-ink/40 font-body text-lg animate-pulse">
              Initializing dispatch core...
            </div>
          }
        >
          <WorkOrdersClient />
        </Suspense>
      </div>
    </div>
  );
}
