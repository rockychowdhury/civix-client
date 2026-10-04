import { Suspense } from "react";
import { TechnicianHistoryClient } from "./TechnicianHistoryClient";

export const metadata = {
  title: "History | Technician Dashboard",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">Loading history...</div>}>
        <TechnicianHistoryClient />
      </Suspense>
    </div>
  );
}
