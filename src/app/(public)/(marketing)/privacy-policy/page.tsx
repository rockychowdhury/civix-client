import { Container } from "@/components/layout/public/container";
import { Footer } from "@/components/layout/public/footer";
import { Navbar } from "@/components/layout/public/navbar";

export const dynamic = "force-static";

export const metadata = {
  title: "Privacy Policy — Civix",
  description: "How Civix collects, uses, and protects citizen data.",
};

const SECTIONS = [
  {
    title: "Data we collect",
    body: "Account details (name, email, phone), the reports you file (descriptions, photos, locations), and the ratings you leave on completed work. Tracking pages are public by design — never attach personal details to a report description.",
  },
  {
    title: "How we use it",
    body: "To route your report to the responsible department, dispatch field crews, verify repairs, and measure municipal performance. We do not sell personal data or use it for advertising.",
  },
  {
    title: "Who sees it",
    body: "Your municipality's departments, dispatchers, and assigned technicians see what's needed to fix the issue. Aggregate, non-identifying statistics may be published for transparency.",
  },
  {
    title: "Retention & deletion",
    body: "Reports persist as part of the public record of municipal work. You may request deletion of your account and personal identifiers at any time via hello@civix.gov.",
  },
  {
    title: "Your rights",
    body: "Access, correct, or delete your personal data on request. Verified citizens may additionally request an export of their reporting history.",
  },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="bg-paper text-ink">
        <Container className="max-w-[880px]">
          <div className="flex flex-col gap-6 py-16 sm:py-24">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Legal</p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink">
              Privacy Policy
            </h1>
            <p className="font-body text-sm text-ink/55">
              Last updated October 2026. Questions:{" "}
              <a
                href="mailto:hello@civix.gov"
                className="font-mono text-ledger hover:underline underline-offset-4 cursor-pointer"
              >
                hello@civix.gov
              </a>
            </p>

            <div className="flex flex-col gap-8 pt-6">
              {SECTIONS.map((s, i) => (
                <section key={s.title} className="border-t border-line/60 pt-6 space-y-2">
                  <h2 className="font-display text-xl font-semibold text-ink">
                    <span className="font-mono text-sm text-ledger mr-3">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.title}
                  </h2>
                  <p className="font-body text-sm leading-relaxed text-ink/70 max-w-[68ch]">
                    {s.body}
                  </p>
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
