import Link from "next/link";

export const dynamic = "force-static";

export const metadata = { title: "Oversight — Civix" };

const LINKS = [
  {
    href: "/system/oversight/issues",
    title: "Civic issues",
    body: "Every report across every municipality, with status override.",
  },
  {
    href: "/system/oversight/requests",
    title: "Service requests",
    body: "Citizen service demand in one queue.",
  },
  {
    href: "/system/oversight/feedback",
    title: "Feedback",
    body: "Satisfaction signals across the platform.",
  },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      <div className="space-y-1 pb-4 border-b border-line">
        <span className="font-mono text-xs uppercase tracking-wider text-ink/50">
          Platform oversight
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
          Oversight
        </h1>
        <p className="font-body text-xs text-ink/65 max-w-xl leading-relaxed">
          Platform-wide lens over issues, requests, and feedback.
        </p>
      </div>
      <div className="flex flex-col gap-3 max-w-3xl">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line/70 bg-paper px-5 py-4 shadow-2xs transition-all hover:border-line hover:shadow-xs"
          >
            <span className="space-y-0.5">
              <span className="block font-display text-base font-semibold text-ink">
                {link.title}
              </span>
              <span className="block font-body text-xs leading-relaxed text-ink/60">
                {link.body}
              </span>
            </span>
            <span className="font-mono text-xs text-ink/40 group-hover:text-ink transition-colors shrink-0">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
