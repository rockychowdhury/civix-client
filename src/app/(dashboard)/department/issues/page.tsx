import { Suspense } from "react";
import { IssuesClient } from "./IssuesClient";

export const metadata = {
  title: "Civic Issues | Civix",
  description: "Operational civic issues triage, field remediation, and resolution monitoring",
};

export default function IssuesPage() {
  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full px-6 md:px-12 pt-8 pb-24">
      <div className="flex-1 w-full flex flex-col animate-slide-up">
        <Suspense
          fallback={
            <div className="h-96 flex items-center justify-center text-ink/40 font-body text-lg animate-pulse">
              Initializing operations core...
            </div>
          }
        >
          <IssuesClient />
        </Suspense>
      </div>
    </div>
  );
}
