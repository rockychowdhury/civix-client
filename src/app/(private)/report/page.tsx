import type { Metadata } from "next";
import { Container } from "@/components/layout/public/container";
import { Navbar } from "@/components/layout/public/navbar";
import { ReportWizard } from "@/components/modules/report/ReportWizard";

export const metadata: Metadata = {
  title: "Report an Issue | Civix",
  description:
    "Report potholes, water leaks, streetlights, sanitation, and civic infrastructure issues directly to your municipal dispatch.",
};

export default function ReportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />
      <main className="flex-1 py-8 sm:py-12">
        <Container>
          <ReportWizard />
        </Container>
      </main>
    </div>
  );
}
