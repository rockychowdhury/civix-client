"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ChevronDown, FilePlus2, LogIn, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMe, useLogout } from "@/hooks/auth.hook";
import { getNavbarRoleMenu } from "@/routes";
import { Container } from "./container";

const RESOLVED_THIS_MONTH = "14,208";

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data, isLoading } = useGetMe();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();

  const user = data?.data;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Signed out", {
          description: "Logged out successfully",
        });
        queryClient.removeQueries({ queryKey: ["user"] });
        router.push("/");
      },
      onError: () => {
        toast.error("Logout failed", {
          description: "Something went wrong while signing out",
        });
      },
    });
  };

  const userName = user?.citizenProfile?.firstName
    ? `${user.citizenProfile.firstName} ${user.citizenProfile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "User";

  const userInitials = (
    user?.citizenProfile?.firstName?.[0]
      ? `${user.citizenProfile.firstName[0]}${user.citizenProfile?.lastName?.[0] || ""}`
      : user?.email?.[0] || "U"
  ).toUpperCase();

  // Extract roles cleanly
  const roles: string[] = [];
  if (user) {
    if (user.userRoles && Array.isArray(user.userRoles)) {
      roles.push(
        ...user.userRoles.map((ur: any) => ur?.role?.code || ur?.role?.name).filter(Boolean),
      );
    } else if (user.roles) {
      roles.push(
        ...user.roles
          .map((r: any) => (typeof r === "string" ? r : r.role?.code || r.role?.name || r.name))
          .filter(Boolean),
      );
    } else if (user.role) {
      roles.push(user.role);
    }
  }

  const roleMenu = getNavbarRoleMenu(roles);

  return (
    <nav
      aria-label="Main navigation"
      className={`sticky top-0 z-[100] border-b border-paper/10 bg-ledger backdrop-blur-md transition-all duration-200 ${
        isScrolled ? "h-13 shadow-md" : "h-15"
      }`}
    >
      <Container className="flex h-full max-w-[1400px] items-center justify-between gap-3">
        {/* Left: Brand Logo & Live Stat Ticker */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Logo className="text-paper" textClassName="text-[clamp(0.925rem,2vw,1.05rem)]" />

          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-paper/10 border border-paper/10 font-body text-xs font-medium text-signal-resolved">
            <span
              className="size-1.5 shrink-0 animate-dot rounded-full bg-signal-resolved motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span>{RESOLVED_THIS_MONTH} resolved this month</span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Public Track Link */}
          <Link
            href="/track"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-paper/80 hover:text-paper hover:bg-paper/10 transition-colors cursor-pointer"
          >
            <Search className="size-3.5 text-paper/60" />
            <span>Track Issue</span>
          </Link>

          {/* Standout "Report an Issue" CTA */}
          <Link
            href="/report"
            className="group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-paper text-ledger hover:bg-paper/90 transition-all shadow-xs hover:shadow-md hover:-translate-y-px active:translate-y-0 cursor-pointer shrink-0"
          >
            <FilePlus2 className="size-3.5 sm:size-4 text-ledger shrink-0 transition-transform group-hover:scale-110" />
            <span>Report Issue</span>
          </Link>

          {/* Conditional Auth Section */}
          {!isLoading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex items-center gap-2 p-1 sm:pr-2.5 rounded-full sm:rounded-xl bg-paper/10 hover:bg-paper/15 border border-paper/15 text-paper transition-all cursor-pointer shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-paper/40"
                >
                  <div className="size-7 sm:size-7.5 rounded-full bg-paper/20 border border-paper/30 text-paper flex items-center justify-center font-mono text-[11px] font-bold shrink-0 shadow-2xs">
                    {userInitials}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-none text-left">
                    <span className="text-xs font-semibold text-paper max-w-[110px] truncate">
                      {userName}
                    </span>
                    <span className="text-[9px] font-mono text-paper/60 uppercase tracking-wider mt-0.5">
                      {roleMenu.badge}
                    </span>
                  </div>
                  <ChevronDown className="size-3.5 text-paper/60 transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0 ml-0.5" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-68 sm:w-72 font-body p-1.5 bg-paper border border-line/70 shadow-xl rounded-2xl text-ink animate-slide-up"
              >
                {/* Profile Header */}
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-field/30 border border-line/40">
                    <div className="size-9 rounded-full bg-ledger text-paper flex items-center justify-center font-mono text-xs font-bold shrink-0 shadow-xs">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink truncate">{userName}</p>
                      <p className="text-[11px] text-ink/55 truncate">{user.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-ledger/10 text-ledger font-semibold border border-ledger/20">
                          {roleMenu.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>

                {/* Role Specific Routes */}
                <div className="px-2 pt-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-ink/40 font-semibold">
                  {roleMenu.title}
                </div>

                <div className="space-y-0.5">
                  {roleMenu.routes.map((route) => {
                    const Icon = route.icon;
                    return (
                      <DropdownMenuItem
                        key={route.href}
                        asChild
                        className="rounded-lg py-2 px-2.5 cursor-pointer hover:bg-field/60 focus:bg-field/70 transition-colors"
                      >
                        <Link
                          href={route.href}
                          className="flex items-center justify-between w-full"
                        >
                          <div className="flex items-center gap-2.5 text-xs text-ink font-medium">
                            <Icon className="size-3.5 text-ledger shrink-0" />
                            <span>{route.label}</span>
                          </div>
                          <ArrowRight className="size-3 text-ink/30" />
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </div>

                <DropdownMenuSeparator className="my-1.5 bg-line/40" />

                {/* Common Utilities */}
                <div className="px-2 pt-1 pb-1 text-[10px] font-mono uppercase tracking-wider text-ink/40 font-semibold">
                  Quick Actions
                </div>

                <div className="space-y-0.5">
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg py-2 px-2.5 cursor-pointer hover:bg-field/60 focus:bg-field/70 transition-colors"
                  >
                    <Link
                      href="/report"
                      className="flex items-center gap-2.5 text-xs text-ink font-medium"
                    >
                      <FilePlus2 className="size-3.5 text-ledger shrink-0" />
                      <span>Report New Incident</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    asChild
                    className="rounded-lg py-2 px-2.5 cursor-pointer hover:bg-field/60 focus:bg-field/70 transition-colors"
                  >
                    <Link href="/track" className="flex items-center gap-2.5 text-xs text-ink">
                      <Search className="size-3.5 text-ink/60 shrink-0" />
                      <span>Track Status by Reference</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-1.5 bg-line/40" />

                {/* Logout Action */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="rounded-lg py-2 px-2.5 cursor-pointer text-signal-open hover:bg-signal-open/10 focus:bg-signal-open/10 focus:text-signal-open transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-xs font-medium">
                    <LogOut className="size-3.5 shrink-0" />
                    <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !isLoading && !user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-paper/85 hover:text-paper hover:bg-paper/10 transition-colors cursor-pointer"
              >
                <LogIn className="size-3.5 text-paper/70" />
                <span>Log in</span>
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-paper/15 hover:bg-paper/20 border border-paper/20 text-paper transition-all cursor-pointer shadow-xs"
              >
                Register
              </Link>
            </div>
          ) : null}

          {/* Theme Switcher */}
          <div className="border-l border-paper/15 pl-2 sm:pl-3">
            <ThemeToggle className="text-paper hover:bg-paper/10 rounded-lg size-8" />
          </div>
        </div>
      </Container>
    </nav>
  );
}
