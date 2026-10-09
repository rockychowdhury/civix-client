import { Suspense } from "react";
import { CitizenProfileView } from "@/components/modules/citizen";

export const dynamic = "force-static";

export const metadata = {
  title: "Profile | Citizen Portal",
  description: "Manage your personal profile and citizen trust score standing.",
};

export default function CitizenProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
          Loading citizen profile...
        </div>
      }
    >
      <CitizenProfileView />
    </Suspense>
  );
}
