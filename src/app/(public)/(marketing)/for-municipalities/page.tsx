import Link from "next/link";
import { Container } from "@/components/layout/public/container";
import { Footer } from "@/components/layout/public/footer";
import { Navbar } from "@/components/layout/public/navbar";

export const dynamic = "force-static";

export const metadata = {
  title: "For Municipalities — Civix",
  description:
    "How Civix helps city governments triage citizen reports, dispatch crews, and prove resolution.",
};

const STEPS = [
  {
    n: "01",
    title: "Structured intake",
    body: "Citizens file geotagged reports with photos under a service catalog owned by your departments — no free-text chaos in the call center.",
  },
  {
    n: "02",
    title: "Triage & routing",
    body: "Duplicate reports merge into single civic issues, auto-routed to the right department, ward, and priority with SLA deadlines attached.",
  },
  {
    n: "03",
    title: "Field dispatch",
    body: "Dispatchers assign technicians or crews, track work orders live, and verify resolutions with photo evidence before anything closes.",
  },
  {
    n: "04",
    title: "Citizen sign-off",
    body: "Resolved work goes back to the reporter for rating. Trusted citizens earn priority dispatch — accountability runs both ways.",
  },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="bg-paper text-ink">
        <Container className="max-w-[880px]">
          <div className="flex flex-col gap-6 py-16 sm:py-24">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
              For municipalities
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink">
              Run your city on a public record of fixed problems.
            </h1>
            <p className="font-body text-base leading-relaxed text-ink/70 max-w-[60ch]">
              Civix turns scattered complaints into an auditable pipeline — every report tracked
              from submission to verified repair, with response targets your council can defend.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xs border border-black/25 bg-ledger px-7 py-3 font-body text-sm font-medium text-paper transition-all hover:-translate-y-px cursor-pointer"
              >
                Talk to us
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center justify-center rounded-xs border border-ledger/30 px-7 py-3 font-body text-sm font-medium text-ledger transition-all hover:-translate-y-px hover:border-ledger cursor-pointer"
              >
                See public tracking
              </Link>
            </div>

            <div className="flex flex-col gap-8 pt-12">
              {STEPS.map((s) => (
                <section
                  key={s.n}
                  className="grid gap-2 border-t border-line/60 pt-6 sm:grid-cols-[64px_1fr] sm:gap-6"
                >
                  <span className="font-mono text-sm font-semibold text-ledger">{s.n}</span>
                  <div className="space-y-2">
                    <h2 className="font-display text-xl font-semibold text-ink">{s.title}</h2>
                    <p className="font-body text-sm leading-relaxed text-ink/70 max-w-[62ch]">
                      {s.body}
                    </p>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
