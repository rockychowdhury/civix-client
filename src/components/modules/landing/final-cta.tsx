import Link from "next/link";
import { Container } from "@/components/layout/public/container";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section aria-labelledby="final-cta-heading" className="py-24 text-center sm:py-32">
      <Container className="max-w-[720px]">
        <h2 id="final-cta-heading" className="sr-only">
          Final Call to Action
        </h2>

        <p className="mb-8 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
          Your city should answer when you report something.
        </p>

        <Button asChild size="lg">
          <Link href="/report">Report an Issue — takes 40 seconds</Link>
        </Button>
      </Container>
    </section>
  );
}
