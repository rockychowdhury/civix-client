import { Suspense } from "react";
import { WorkExecutionView } from "@/components/modules/technician";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export const metadata = {
  title: "Work Order | Technician Dashboard",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
            Loading job...
          </div>
        }
      >
        <WorkExecutionView />
      </Suspense>
    </div>
  );
}
