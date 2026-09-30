import { Container } from "./container";

const pullQuote =
  "Most complaints don't fail because no one filed them. They fail because no one owns them after that.";

const observations = [
  "Reports get sent to the wrong department.",
  "No one tracks how long anything actually takes.",
  "Citizens have no way to know if their report was even seen.",
];

export function BrokenLoop() {
  return (
    <section aria-labelledby="broken-loop-heading" className="py-20 sm:py-24">
      <Container className="max-w-[800px]">
        <blockquote
          id="broken-loop-heading"
          className="mb-16 border-l-[3px] border-signal-open pl-8 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-normal leading-[1.1] text-ink"
        >
          {pullQuote}
        </blockquote>

        <div className="flex flex-col gap-6">
          {observations.map((observation, i) => (
            <div
              key={observation}
              className={`flex gap-6 py-4 ${
                i < observations.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="mt-1 w-[3px] shrink-0 self-stretch bg-signal-open"
              />
              <p className="flex-1 font-body text-[clamp(1rem,2vw,1.125rem)] leading-relaxed text-ink">
                {observation}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
