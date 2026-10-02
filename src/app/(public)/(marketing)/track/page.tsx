import { Suspense } from "react";
import { TrackerPage } from "@/components/modules/tracker/TrackerPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TrackerPage />
    </Suspense>
  );
}
