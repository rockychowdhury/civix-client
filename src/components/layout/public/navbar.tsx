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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutDashboard, ChevronDown } from "lucide-react";

const RESOLVED_THIS_MONTH = "14,208";

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data, isLoading } = useGetMe();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();

  const user = data?.data;

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
    const roles: string[] = [];
    
    // The backend provides "userRoles" for this user schema
    if (user.userRoles && Array.isArray(user.userRoles)) {
      roles.push(...user.userRoles.map((ur: any) => ur?.role?.name || ur?.role?.code).filter(Boolean));
    } else if (user.roles) {
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
          <span className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-signal-resolved hidden sm:inline-flex">
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

          <Button asChild variant="inverse" size="sm" className="shrink-0 px-4 py-2">
            <Link href="/report">Report an Issue</Link>
          </Button>

          {!isLoading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2 text-paper hover:bg-paper/10 hover:text-paper focus:ring-0 focus-visible:ring-0 focus-visible:outline-none border-0 outline-none ring-0">
                  <span className="font-body text-sm font-medium">{userName}</span>
                  <ChevronDown className="size-4 text-paper/70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 font-body">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-ink">{userName}</p>
                    <p className="text-xs leading-none text-ink/70">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {dashboardHref && dashboardHref !== "/" && (
                  <DropdownMenuItem asChild className="cursor-pointer transition-colors focus:bg-ink/5">
                    <Link href={dashboardHref} className="flex items-center w-full">
                      <LayoutDashboard className="mr-2 size-4 text-ink/70" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  disabled={logoutMutation.isPending}
                  className="cursor-pointer text-red-600 transition-colors focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !isLoading && !user ? (
            <Button asChild variant="ghost" size="sm" className="px-0 text-paper/80 hover:text-paper">
              <Link href="/login">
                Log in
              </Link>
            </Button>
          ) : null}

          <ThemeToggle className="text-paper" />
        </div>
      </Container>
    </nav>
  );
}
