import { Suspense } from "react";
import { TrackerPage } from "@/components/modules/tracker/TrackerPage";

export const dynamic = "force-static";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TrackerPage />
    </Suspense>
  );
}
