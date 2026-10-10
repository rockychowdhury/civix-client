import { Suspense } from "react";
import { TechnicianProfileClient } from "./TechnicianProfileClient";

export const dynamic = "force-static";

export const metadata = {
  title: "Profile & Shift | Technician Operations",
  description: "Technician field profile, shift availability, and operational metrics.",
};

export default function TechnicianProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
          Loading profile...
        </div>
      }
    >
      <TechnicianProfileClient />
    </Suspense>
  );
}
