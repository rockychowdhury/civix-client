import type { Metadata } from "next";
import { Container } from "@/components/layout/public/container";
import { Footer } from "@/components/layout/public/footer";
import { Navbar } from "@/components/layout/public/navbar";
import { ReportWizard } from "@/components/modules/report/ReportWizard";

export const metadata: Metadata = {
  title: "Report an Issue | Civix",
  description: "Report civic issues to your local municipality.",
};

export default function ReportPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-3.5rem)] bg-paper/50 py-12 sm:py-20">
        <Container>
          <div className="mb-12">
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-ink">
              Report an Issue
            </h1>
            <p className="mt-4 text-lg text-ink/70 max-w-2xl">
              Help us keep the city running. Tell us what's wrong and where it is, and we'll route
              it to the right department.
            </p>
          </div>

          <ReportWizard categories={[]} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
