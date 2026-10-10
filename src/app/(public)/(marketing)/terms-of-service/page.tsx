import { Container } from "@/components/layout/public/container";
import { Footer } from "@/components/layout/public/footer";
import { Navbar } from "@/components/layout/public/navbar";

export const dynamic = "force-static";

export const metadata = {
  title: "Terms of Service — Civix",
  description: "The rules for using Civix as a citizen or municipal partner.",
};

const SECTIONS = [
  {
    title: "File honest reports",
    body: "Submit accurate descriptions, real photos, and correct locations. Knowingly false reports, spam, or abuse of the reporting queue may lead to throttling or account suspension.",
  },
  {
    title: "Your account is yours",
    body: "Keep your credentials private. You are responsible for activity under your account, including the trust score your verification history builds.",
  },
  {
    title: "Content you post",
    body: "You grant Civix and your municipality a license to use report content — descriptions, photos, locations — for triage, dispatch, verification, and public transparency of completed work.",
  },
  {
    title: "Verification & feedback",
    body: "Rate completed work fairly and only work you can speak to. Feedback directly affects crew records and your own citizen standing.",
  },
  {
    title: "Availability",
    body: "Civix is provided as-is for civic reporting. Emergencies must always go to 999 first — never rely on a report queue when life or property is at risk.",
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
              Terms of Service
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
