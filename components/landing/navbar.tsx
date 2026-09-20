"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { Container } from "./container";
import { TrackReportDialog } from "./track-report-dialog";

const RESOLVED_THIS_MONTH = "14,208";

const navLinks = [
  { href: "/municipalities", label: "For Municipalities" },
  { href: "/data", label: "Public Data" },
];

type NavbarProps = {
  user?: { name: string } | null;
};

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleLogout() {
    await authService.logout();
    router.refresh();
  }

  return (
    <nav
      aria-label="Main navigation"
      className={`sticky top-0 z-[100] border-b border-paper/10 bg-ledger transition-[height] duration-200 ${
        isScrolled ? "h-12" : "h-14"
      }`}
    >
      <Container className="flex h-full max-w-[1400px] items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Civix home"
          className="flex shrink-0 items-center gap-2 font-display text-[clamp(0.875rem,2vw,1rem)] tracking-[0.025em] text-paper"
        >
          Civix
          <span className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-signal-resolved">
            <span
              className="size-1.5 shrink-0 animate-dot rounded-full bg-signal-resolved motion-reduce:animate-none"
              aria-hidden="true"
            />
            {RESOLVED_THIS_MONTH} resolved this month
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <TrackReportDialog>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-0 text-paper/80 hover:text-paper"
            >
              Track a Report
            </Button>
          </TrackReportDialog>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap py-1 font-body text-sm text-paper/80 transition-colors hover:text-paper"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <span className="flex items-center gap-3">
              <span className="whitespace-nowrap py-1 font-body text-sm text-paper">
                {user.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="px-0 text-paper/80 hover:text-paper"
              >
                Log out
              </Button>
            </span>
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap py-1 font-body text-sm text-paper/80 transition-colors hover:text-paper"
            >
              Log in
            </Link>
          )}

          <Button asChild variant="inverse" size="sm" className="ml-2 shrink-0 px-4 py-2">
            <Link href="/report">Report an Issue</Link>
          </Button>

          <ThemeToggle className="text-paper" />
        </div>
      </Container>
    </nav>
  );
}
