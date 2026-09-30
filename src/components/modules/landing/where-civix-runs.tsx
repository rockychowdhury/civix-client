import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "./container";

const municipalities = [
  {
    name: "Dhaka North City Corporation",
    since: "March 2026",
    resolved: 8400,
    population: "5.2M",
  },
  {
    name: "Kolkata Municipal Corporation",
    since: "February 2026",
    resolved: 12300,
    population: "4.5M",
  },
  {
    name: "Chittagong South",
    since: "January 2026",
    resolved: 5200,
    population: "2.8M",
  },
  {
    name: "Sylhet City Corporation",
    since: "December 2025",
    resolved: 2100,
    population: "0.5M",
  },
  {
    name: "Rajshahi Metropolitan",
    since: "November 2025",
    resolved: 1800,
    population: "0.9M",
  },
  {
    name: "Khulna City Corporation",
    since: "October 2025",
    resolved: 3100,
    population: "1.5M",
  },
];

export function WhereCivixRuns() {
  return (
    <section aria-labelledby="where-heading" className="py-20 sm:py-24">
      <Container className="max-w-[800px]">
        <h2 id="where-heading" className="sr-only">
          Where Civix Runs
        </h2>

        <div className="flex flex-col">
          {municipalities.map((municipality) => (
            <div
              key={municipality.name}
              className="grid grid-cols-1 gap-6 border-b border-line px-8 py-6 transition-colors odd:bg-paper even:bg-ink/[0.02] hover:bg-ledger/[0.04]"
            >
              <div className="flex flex-col gap-1">
                <p className="font-display text-[clamp(1rem,2vw,1.125rem)] font-normal leading-tight text-ink">
                  {municipality.name}
                </p>
                <p className="font-mono text-[0.8125rem] text-ink/60">
                  Live since {municipality.since} · {municipality.population} residents ·{" "}
                  {municipality.resolved.toLocaleString()} issues resolved
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center">
          <Button asChild variant="ghost">
            <Link href="/municipalities">Bring Civix to your city →</Link>
          </Button>
        </p>
      </Container>
    </section>
  );
}
