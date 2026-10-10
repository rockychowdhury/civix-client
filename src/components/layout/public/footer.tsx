import Link from "next/link";
import { AccessibilityControls } from "@/components/shared/accessibility-controls";
import { Logo } from "@/components/shared/logo";
import { Container } from "./container";
import { ScrollTopButton } from "./scroll-top-button";

const footerMunicipalities = [
  "Dhaka North",
  "Kolkata",
  "Chittagong South",
  "Sylhet",
  "Rajshahi",
  "Khulna",
];

const footerLinks: { category: string; links: { label: string; href: string }[] }[] = [
  {
    category: "Product",
    links: [
      { label: "Track a Report", href: "/track" },
      { label: "Report an Issue", href: "/report" },
      { label: "For Municipalities", href: "/for-municipalities" },
    ],
  },
  {
    category: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    category: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
    ],
  },
];

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
              <Logo
                className="mb-4 text-paper"
                textClassName="text-[clamp(1.25rem,3vw,1.5rem)] leading-tight"
              />
              <p className="max-w-[320px] font-body text-[0.9375rem] leading-relaxed text-paper/70">
                A public record for problems that get fixed, not filed away.
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8">
              {footerLinks.map(({ category, links }) => (
                <nav key={category} aria-label={`Footer — ${category}`}>
                  <p className="mb-4 font-body text-xs font-medium uppercase tracking-[0.05em] text-signal-resolved">
                    {category}
                  </p>
                  <ul className="m-0 list-none p-0">
                    {links.map((link) => (
                      <li key={link.href} className="mb-2">
                        <Link
                          href={link.href}
                          className="font-body text-sm text-paper/70 transition-colors hover:text-paper"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
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

          <div className="flex items-center justify-between gap-6 border-t border-line/20 pt-8">
            <p className="m-0 font-mono text-xs text-paper/50">
              © {new Date().getFullYear()} Civix
            </p>
            <ScrollTopButton />
          </div>
        </div>
      </Container>
    </footer>
  );
}
