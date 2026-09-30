import { TrackerPage } from "@/components/modules/tracker/TrackerPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TrackerPage />
    </Suspense>
  );
}
