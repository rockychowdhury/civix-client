import { Suspense } from "react";
import { AssignmentInboxView } from "@/components/modules/technician";

export const dynamic = "force-static";

export const metadata = {
  title: "Inbox | Technician Dashboard",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-ink">Inbox</h1>
        <p className="font-body text-sm text-ink/60">
          New dispatches first — accept to take a job, reject to send it back.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
            Loading inbox...
          </div>
        }
      >
        <AssignmentInboxView />
      </Suspense>
    </div>
  );
}
