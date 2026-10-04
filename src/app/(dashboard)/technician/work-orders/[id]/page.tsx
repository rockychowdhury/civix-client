import { Suspense } from "react";
import { TechnicianWorkOrderDetailClient } from "./TechnicianWorkOrderDetailClient";

export const metadata = {
  title: "Work Order Detail | Technician Dashboard",
};

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">Loading work order...</div>}>
        <TechnicianWorkOrderDetailClient id={params.id} />
      </Suspense>
    </div>
  );
}
