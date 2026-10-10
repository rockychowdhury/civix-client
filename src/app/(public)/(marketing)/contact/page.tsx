import { Container } from "@/components/layout/public/container";
import { Footer } from "@/components/layout/public/footer";
import { Navbar } from "@/components/layout/public/navbar";

export const dynamic = "force-static";

export const metadata = {
  title: "Contact — Civix",
  description: "Reach the Civix team, your municipality, or emergency services.",
};

const CHANNELS = [
  {
    title: "Municipal services & info",
    detail: "Public helpline for complaints and service information.",
    action: { label: "Call 333", href: "tel:333" },
  },
  {
    title: "National emergency",
    detail: "Police, fire, and ambulance. Always call first in danger.",
    action: { label: "Call 999", href: "tel:999" },
  },
  {
    title: "General inquiries",
    detail: "Questions about Civix, partnerships, and municipality onboarding.",
    action: { label: "hello@civix.gov", href: "mailto:hello@civix.gov" },
  },
  {
    title: "Accessibility barriers",
    detail: "Report anything that blocks you from using Civix.",
    action: { label: "access@civix.gov", href: "mailto:access@civix.gov" },
  },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="bg-paper text-ink">
        <Container className="max-w-[880px]">
          <div className="flex flex-col gap-6 py-16 sm:py-24">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Contact</p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink">
              Talk to a human.
            </h1>
            <p className="font-body text-base leading-relaxed text-ink/70 max-w-[60ch]">
              For a broken streetlight or missed collection, filing a report reaches your
              municipality faster than email. For everything else, use a channel below.
            </p>

            <div className="grid gap-3.5 pt-6 sm:grid-cols-2">
              {CHANNELS.map((c) => (
                <div
                  key={c.title}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-line/70 bg-paper p-5 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <h2 className="font-display text-base font-semibold text-ink">{c.title}</h2>
                    <p className="font-body text-xs leading-relaxed text-ink/65">{c.detail}</p>
                  </div>
                  <a
                    href={c.action.href}
                    className="font-mono text-sm font-semibold text-ledger hover:underline underline-offset-4 cursor-pointer w-fit"
                  >
                    {c.action.label} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
