"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { hasPermission } from "@/lib/permissions";
import { ROLE_PORTAL_MAP } from "@/lib/role-routing";
import { NAV_CONFIG, type NavItem } from "@/routes";

export function AppSidebar({ userRoleCodes }: { userRoleCodes: string[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Find which portal we're in
  const currentPortal = Object.values(ROLE_PORTAL_MAP).find((portal) =>
    pathname.startsWith(portal),
  );
  const navItems = currentPortal ? NAV_CONFIG[currentPortal as keyof typeof NAV_CONFIG] : [];

  // Filter items by permission (single source of truth matrix)
  const visibleItems = navItems?.filter((item: NavItem) => {
    if (!item.permission) return true;
    return hasPermission(userRoleCodes, item.permission as any);
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 flex items-center justify-center border-b border-sidebar-border px-4 py-2 overflow-hidden">
        <Logo
          className="text-sidebar-foreground w-full justify-start overflow-hidden"
          textClassName="group-data-[collapsible=icon]:hidden text-[clamp(0.875rem,1.5vw,1rem)]"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems?.map((item: NavItem) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.url || (item.items && pathname.startsWith(item.url))
                    }
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.items && pathname.startsWith(item.url) && (
                    <div className="pl-6 pt-2 pb-1 space-y-1 group-data-[collapsible=icon]:hidden overflow-hidden transition-all duration-200">
                      {item.items.map((subItem: any) => {
                        const subUrl = subItem.url;
                        const subQuery = subUrl.includes("?") ? subUrl.split("?")[1] : "";
                        const subParams = new URLSearchParams(subQuery);
                        let isSubActive = false;

                        if (subParams.toString()) {
                          const statusParam = subParams.get("status");
                          const filterParam = subParams.get("filter");
                          if (statusParam) {
                            const currentStatus = searchParams.get("status") || "on-queue";
                            isSubActive = currentStatus === statusParam;
                          } else if (filterParam) {
                            const currentFilter = searchParams.get("filter") || "today";
                            isSubActive = currentFilter === filterParam;
                          } else {
                            isSubActive = Array.from(subParams.entries()).every(
                              ([k, v]) => searchParams.get(k) === v,
                            );
                          }
                        } else {
                          isSubActive = pathname === subUrl;
                        }

                        return (
                          <Link
                            key={subItem.title}
                            href={subItem.url}
                            className={`block text-sm px-2 py-1.5 rounded-md transition-colors ${
                              isSubActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
