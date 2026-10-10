import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { AddStaffForm } from "@/components/form/add-staff-form";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-static";

export const metadata = {
  title: "Onboard Staff | Civix",
  description: "Provision operational accounts for department technicians and dispatchers",
};

export default function AddStaffPage() {
  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-slide-up">
      {/* Top Header Row with Breadcrumb */}
      <div className="flex flex-col gap-2 border-b border-line/40 pb-5">
        <Link
          href="/department/technicians"
          className="inline-flex items-center text-xs font-medium text-ink/50 hover:text-ink transition-colors cursor-pointer w-fit group"
        >
          <ChevronLeft className="size-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          Back to Staff Directory
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
              Onboard Department Staff
            </h1>
            <Badge
              variant="secondary"
              className="bg-ink/5 text-ink/70 border-line/40 font-mono text-[11px] px-2 py-0.5"
            >
              Provisioning Portal
            </Badge>
          </div>
          <p className="text-xs text-ink/60 max-w-md">
            Configure role permissions and generate credentials for field technicians and dispatch
            staff.
          </p>
        </div>
      </div>

      {/* Main Grid Form */}
      <AddStaffForm />
    </div>
  );
}
