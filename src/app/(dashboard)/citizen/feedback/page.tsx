import { Suspense } from "react";
import { CitizenFeedbackView } from "@/components/modules/citizen";

export const dynamic = "force-static";

export const metadata = {
  title: "Feedback & Reviews | Citizen Portal",
  description: "Rate completed resolutions and provide feedback on civic services.",
};

export default function CitizenFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-ink/40 font-body animate-pulse">
          Loading feedback reviews...
        </div>
      }
    >
      <CitizenFeedbackView />
    </Suspense>
  );
}
