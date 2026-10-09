import { ReportWizard } from "@/components/modules/report/ReportWizard";

export const dynamic = "force-static";

export const metadata = {
  title: "Report an Issue | Citizen Portal",
  description: "Submit a new civic issue report with category, location, and photos.",
};

export default function CitizenReportPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold text-ink">Report an Issue</h1>
        <p className="font-body text-sm text-ink/60">
          Provide issue details and location to route your report directly to the responsible
          municipal department.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-paper p-6 sm:p-8">
        <ReportWizard categories={[]} />
      </div>
    </div>
  );
}
