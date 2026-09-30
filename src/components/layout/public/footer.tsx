import Link from "next/link";
import { AccessibilityControls } from "@/components/shared/accessibility-controls";
import { Container } from "./container";

const footerMunicipalities = [
  "Dhaka North",
  "Kolkata",
  "Chittagong South",
  "Sylhet",
  "Rajshahi",
  "Khulna",
];

const footerLinks = {
  Product: ["Track a Report", "For Municipalities", "Public Data", "API Documentation"],
  Company: ["About", "Careers", "Press", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Data Processing", "System Status"],
};

export function Footer() {
  return (
    <footer role="contentinfo" className="border-t border-line bg-ink pb-8 pt-16 text-paper">
      <Container>
        <div className="flex flex-col gap-16">
          <div className="border-b border-line/30 pb-12">
            <p className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.1em] text-signal-resolved">
              Municipalities on Civix
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-6">
              {footerMunicipalities.map((city, i) => (
                <span key={city} className="py-1 font-body text-sm text-paper/80">
                  {city}
                  {i < footerMunicipalities.length - 1 && (
                    <span className="ml-8 opacity-30">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-12">
            <div>
              <p className="mb-4 font-display text-[clamp(1.25rem,3vw,1.5rem)] leading-tight text-paper">
                Civix
              </p>
              <p className="max-w-[320px] font-body text-[0.9375rem] leading-relaxed text-paper/70">
                A public record for problems that get fixed, not filed away.
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <p className="mb-4 font-body text-xs font-medium uppercase tracking-[0.05em] text-signal-resolved">
                    {category}
                  </p>
                  <ul className="m-0 list-none p-0">
                    {links.map((link) => (
                      <li key={link} className="mb-2">
                        <Link
                          href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
                          className="font-body text-sm text-paper/70 transition-colors hover:text-paper"
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-line/20 pt-8">
            <p className="max-w-[56ch] font-body text-xs leading-relaxed text-paper/50">
              Civix aims to meet WCAG 2.1 AA. To report an accessibility barrier, email
              access@civix.gov. Text size and contrast controls are below.
            </p>
            <AccessibilityControls />
          </div>

          <div className="flex flex-col gap-6 border-t border-line/20 pt-8">
            <p className="m-0 flex flex-wrap items-center gap-6 font-mono text-xs text-paper/50">
              <span>System status: operational</span>
              <span>Uptime: 99.97%</span>
              <Link href="/status" className="text-paper/50 transition-colors hover:text-paper">
                Incident log
              </Link>
              <span>© {new Date().getFullYear()} Civix</span>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
