import Link from "next/link";
import { AdminPageHeader } from "@/components/modules/admin";

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
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Oversight"
        description="Platform-wide lens over issues, requests, and feedback."
      />
      <div className="flex flex-col gap-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex cursor-pointer flex-col gap-1 rounded-xs border border-line/40 bg-paper px-5 py-4 transition-colors hover:border-line hover:bg-field/30"
          >
            <span className="font-display text-lg font-medium text-ink">{link.title}</span>
            <span className="font-body text-sm leading-relaxed text-ink/60">{link.body}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
