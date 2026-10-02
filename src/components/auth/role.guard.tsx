"use client";

import { useGetMe } from "@/hooks";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo } from "react";
import { UserRole } from "@/types";
import Loading from "@/app/loading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROLE_PORTAL_MAP, getDashboardHref } from "@/lib/role-routing";

interface IProps {
  children: ReactNode;
  roles?: UserRole[];
}

export default function RoleGuard({ children, roles }: IProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { data, isPending, isError, isFetching } = useGetMe();
  const user = data?.data;

  // Wait if it's strictly pending, or fetching while user is not loaded
  const isLoadingAuth = isPending || (isFetching && !user);

  const isAuthorized = useMemo(() => {
    if (!user) return false;
    
    // Parse roles based on the API payload structure
    const userRoleCodes: string[] = [];
    if (user.userRoles && Array.isArray(user.userRoles)) {
      userRoleCodes.push(...user.userRoles.map((ur: any) => ur?.role?.code || ur?.role?.name?.toUpperCase()).filter(Boolean));
    } else if (user.roles) {
      userRoleCodes.push(...user.roles.map((r: any) => typeof r === "string" ? r.toUpperCase() : (r.role?.code || r.role?.name?.toUpperCase() || r.name?.toUpperCase())).filter(Boolean));
    } else if (user.role) {
      userRoleCodes.push(typeof user.role === "string" ? user.role.toUpperCase() : user.role?.code || user.role?.name?.toUpperCase());
    }

    if (roles && roles.length > 0) {
      return roles.some(role => userRoleCodes.includes(role));
    }

    // Auto-detect from pathname using the portal map
    for (const [role, portal] of Object.entries(ROLE_PORTAL_MAP)) {
      if (pathname.startsWith(portal) && userRoleCodes.includes(role)) {
        return true;
      }
    }
    
    return false;
  }, [user, roles, pathname]);

  useEffect(() => {
    if (isLoadingAuth) return;
    
    if (isError || !user) {
      router.replace("/login");
    } else if (!isAuthorized) {
      // If they are logged in but unauthorized for this specific dashboard, redirect them to their actual one
      const userRoleCodes: string[] = [];
      if (user.userRoles && Array.isArray(user.userRoles)) {
        userRoleCodes.push(...user.userRoles.map((ur: any) => ur?.role?.code || ur?.role?.name?.toUpperCase()).filter(Boolean));
      } else if (user.roles) {
        userRoleCodes.push(...user.roles.map((r: any) => typeof r === "string" ? r.toUpperCase() : (r.role?.code || r.role?.name?.toUpperCase() || r.name?.toUpperCase())).filter(Boolean));
      } else if (user.role) {
        userRoleCodes.push(typeof user.role === "string" ? user.role.toUpperCase() : user.role?.code || user.role?.name?.toUpperCase());
      }
      
      const correctDashboard = getDashboardHref(userRoleCodes);
      if (pathname !== correctDashboard) {
        router.replace(correctDashboard);
      }
    }
  }, [isLoadingAuth, isError, user, router, isAuthorized, pathname]);

  if (isLoadingAuth) {
    return <Loading />;
  }

  if (isError || !user) {
    return <Loading />;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center p-6 bg-paper text-center">
      <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Access Denied</h1>
      <p className="mt-4 font-body text-ink/70 max-w-md">
        You do not have the required permissions to view this area.
      </p>
      <div className="mt-8">
        <Button asChild >
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}