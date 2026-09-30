import { Container } from "./container";

export function VerifiedTrusted() {
  return (
    <section aria-labelledby="verified-heading" className="py-20 sm:py-24">
      <Container className="max-w-[720px]">
        <h2 id="verified-heading" className="sr-only">
          Verified &amp; Trusted
        </h2>

        <p className="mb-16 font-body text-[clamp(1rem,2vw,1.125rem)] leading-relaxed text-ink">
          You can report anonymously with just an email — no ID required. If you choose to verify
          your identity, your report gets a verification badge that helps city officials prioritize
          credible submissions.
        </p>

        <div className="grid gap-8">
          <div className="rounded-xs border border-line bg-paper px-6 py-8">
            <p className="mb-4 font-body text-[0.8125rem] font-medium uppercase tracking-[0.05em] text-ink/50">
              Basic report
            </p>
            <p className="mb-6 font-body text-[clamp(0.9375rem,1.5vw,1rem)] leading-relaxed text-ink">
              Submit with email only. Your report enters the queue and is tracked publicly. City
              staff can see and act on it.
            </p>
            <div className="flex items-center gap-4 border-t border-line pt-6">
              <span
                aria-hidden="true"
                className="flex size-5 shrink-0 items-center justify-center rounded-xs border-2 border-line"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M3 6L5.5 8.5L9 3.5"
                    stroke="var(--color-line)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="font-body text-[0.8125rem] text-ink/70">
                Submitted — tracked — resolved
              </span>
            </div>
          </div>

          <div className="rounded-xs border border-signal-resolved bg-signal-resolved/[0.04] px-6 py-8">
            <p className="mb-4 font-body text-[0.8125rem] font-medium uppercase tracking-[0.05em] text-signal-resolved">
              Verified report
            </p>
            <p className="mb-6 font-body text-[clamp(0.9375rem,1.5vw,1rem)] leading-relaxed text-ink">
              Optional identity verification adds a trust badge. Verified reports are flagged for
              priority review and carry more weight in departmental workload allocation.
            </p>
            <div className="flex items-center gap-4 border-t border-signal-resolved pt-6">
              <span
                aria-hidden="true"
                className="flex size-5 shrink-0 items-center justify-center rounded-xs bg-signal-resolved"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M3 6L5.5 8.5L9 3.5"
                    stroke="var(--color-paper)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="font-body text-[0.8125rem] font-medium text-signal-resolved">
                Verified — priority queue — weighted
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
