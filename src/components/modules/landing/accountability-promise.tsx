import { Container } from "@/components/layout/public/container";

export function AccountabilityPromise() {
  return (
    <section aria-labelledby="accountability-heading" className="py-24 sm:py-28">
      <Container className="max-w-[900px]">
        <h2 id="accountability-heading" className="sr-only">
          Accountability Promise
        </h2>

        <blockquote className="mb-8 max-w-full sm:max-w-[85%] border-l-[3px] border-ink pl-6 sm:pl-12 font-display text-[clamp(1.5rem,4.5vw,3.5rem)] font-normal leading-[1.15] text-ink break-words">
          Every report has a deadline. If a department misses it, the issue escalates automatically
          — no one has to ask twice.
        </blockquote>

        <p className="max-w-[560px] font-body text-[clamp(0.875rem,1.5vw,1rem)] leading-relaxed text-ink/70">
          Departments that miss their deadline trigger an automatic escalation path. The report is
          routed to the department supervisor, then to the city administrator, and finally to the
          public dashboard if unresolved within 14 days.
        </p>
      </Container>
    </section>
  );
}
