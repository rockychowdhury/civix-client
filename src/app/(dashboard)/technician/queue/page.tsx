import { Suspense } from "react";
import { TechnicianQueueClient } from "./TechnicianQueueClient";

export const metadata = {
  title: "My Queue | Technician Dashboard",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">Loading queue...</div>}>
        <TechnicianQueueClient />
      </Suspense>
    </div>
  );
}
