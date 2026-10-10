import { Suspense } from "react";
import { AssignmentInboxView } from "@/components/modules/technician";

export const dynamic = "force-static";

export const metadata = {
  title: "Assignments Inbox | Technician Operations",
  description: "Incoming field work order dispatches and requests.",
};

export default function TechnicianInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
          Loading inbox...
        </div>
      }
    >
      <AssignmentInboxView />
    </Suspense>
  );
}
