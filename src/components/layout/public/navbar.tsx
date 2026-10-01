"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { useGetMe, useLogout } from "@/hooks/auth.hook";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Container } from "./container";
import { getDashboardHref } from "@/lib/role-routing";

const RESOLVED_THIS_MONTH = "14,208";

const navLinks = [
  { href: "/municipalities", label: "For Municipalities" },
  { href: "/data", label: "Public Data" },
];

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: user, isLoading } = useGetMe();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Tata", {
          description: "Logged out successfully",
        });
        queryClient.removeQueries({ queryKey: ["user"] });
        router.push("/");
      },
      onError: () => {
        toast.error("Logout failed", {
          description: "Something went wrong",
        });
      },
    });
  };

  const userName = user?.citizenProfile?.firstName 
    ? `${user.citizenProfile.firstName} ${user.citizenProfile.lastName}`
    : user?.email;

  let dashboardHref = undefined;
  if (user) {
    const roles = [];
    if (user.roles) {
        roles.push(...user.roles.map((r: any) => typeof r === "string" ? r : (r.role?.name || r.name)).filter(Boolean));
    } else if (user.role) {
        roles.push(user.role);
    }
    dashboardHref = getDashboardHref(roles);
  }

  return (
    <nav
      aria-label="Main navigation"
      className={`sticky top-0 z-[100] border-b border-paper/10 bg-ledger transition-[height] duration-200 ${
        isScrolled ? "h-12" : "h-14"
      }`}
    >
      <Container className="flex h-full max-w-[1400px] items-center justify-between gap-4">
        <div className="flex shrink-0 items-center gap-4">
          <Logo className="text-paper" textClassName="text-[clamp(0.875rem,2vw,1rem)]" />
          <span className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-signal-resolved">
            <span
              className="size-1.5 shrink-0 animate-dot rounded-full bg-signal-resolved motion-reduce:animate-none"
              aria-hidden="true"
            />
            {RESOLVED_THIS_MONTH} resolved this month
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="px-0 text-paper/80 hover:text-paper"
          >
            <Link href="/track">Track a Report</Link>
          </Button>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap py-1 font-body text-sm text-paper/80 transition-colors hover:text-paper"
            >
              {link.label}
            </Link>
          ))}

          {!isLoading && user ? (
            <span className="flex items-center gap-4">
              <span className="whitespace-nowrap py-1 font-body text-sm text-paper">
                {userName}
              </span>
              {dashboardHref && dashboardHref !== "/" && (
                <Link
                  href={dashboardHref}
                  className="whitespace-nowrap py-1 font-body text-sm text-paper/80 transition-colors hover:text-paper"
                >
                  Dashboard
                </Link>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                loading={logoutMutation.isPending}
                loadingText="Logging out…"
                className="px-0 text-paper/80 hover:text-paper"
              >
                Log out
              </Button>
            </span>
          ) : !isLoading && !user ? (
            <Button asChild variant="ghost" size="sm" className="px-0 text-paper/80 hover:text-paper">
              <Link href="/login">
                Log in
              </Link>
            </Button>
          ) : null}

          <Button asChild variant="inverse" size="sm" className="ml-2 shrink-0 px-4 py-2">
            <Link href="/report">Report an Issue</Link>
          </Button>

          <ThemeToggle className="text-paper" />
        </div>
      </Container>
    </nav>
  );
}
