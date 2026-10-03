"use client";

import {
  Activity,
  BarChart3,
  Building2,
  CheckSquare,
  FileText,
  History,
  Home,
  ListTodo,
  Map,
  Settings,
  ShieldAlert,
  User,
  Users,
} from "lucide-react";
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
import { ROLE_PORTAL_MAP } from "@/lib/role-routing";

// Config matches the design instructions
const NAV_CONFIG = {
  "/citizen": [
    { title: "Overview", url: "/citizen/overview", icon: Home },
    { title: "My Reports", url: "/citizen/my-reports", icon: FileText },
    { title: "Profile", url: "/citizen/profile", icon: User },
  ],
  "/technician": [
    { title: "Today's Queue", url: "/technician/queue", icon: ListTodo },
    { title: "Completed", url: "/technician/history", icon: History },
    { title: "Profile", url: "/technician/profile", icon: User },
  ],
  "/department": [
    { title: "Overview", url: "/department/overview", icon: Home, roles: ["DEPARTMENT_MANAGER"] },
    { title: "Work Orders", url: "/department/work-orders", icon: CheckSquare },
    { 
      title: "Issue Queue", 
      url: "/department/issues", 
      icon: ListTodo,
      items: [
        { title: "On Queue", url: "/department/issues?status=on-queue" },
        { title: "Scheduled", url: "/department/issues?status=scheduled" },
        { title: "Pending", url: "/department/issues?status=pending" },
        { title: "All", url: "/department/issues?status=all" }
      ]
    },
    { title: "Citizen Reports", url: "/department/citizen-reports", icon: FileText },
    {
      title: "Technician Roster",
      url: "/department/technicians",
      icon: Users,
      roles: ["DEPARTMENT_MANAGER"],
    },
    {
      title: "Analytics",
      url: "/department/reports",
      icon: BarChart3,
      roles: ["DEPARTMENT_MANAGER"],
    },
  ],
  "/municipality": [
    { title: "Overview", url: "/municipality/overview", icon: Home },
    { title: "Departments", url: "/municipality/departments", icon: Building2 },
    { title: "Categories & Routing", url: "/municipality/categories", icon: FileText },
    { title: "Wards & Zones", url: "/municipality/wards-zones", icon: Map },
    { title: "Analytics", url: "/municipality/analytics", icon: BarChart3 },
    { title: "Audit Log", url: "/municipality/audit-log", icon: ShieldAlert },
  ],
  "/system": [
    { title: "Overview", url: "/system/overview", icon: Home },
    { title: "Municipalities", url: "/system/municipalities", icon: Building2 },
    { title: "Users & Roles", url: "/system/users-roles", icon: Users },
    { title: "Platform Settings", url: "/system/platform-settings", icon: Settings },
    { title: "System Health", url: "/system/system-health", icon: Activity },
    { title: "Audit Log", url: "/system/audit-log", icon: ShieldAlert },
  ],
};

export function AppSidebar({ userRoleCodes }: { userRoleCodes: string[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Find which portal we're in
  const currentPortal = Object.values(ROLE_PORTAL_MAP).find((portal) =>
    pathname.startsWith(portal),
  );
  const navItems = currentPortal ? NAV_CONFIG[currentPortal as keyof typeof NAV_CONFIG] : [];

  // Filter items by role (for department manager vs dispatcher)
  const visibleItems = navItems?.filter((item: any) => {
    if (!item.roles) return true;
    return item.roles.some((r: string) => userRoleCodes.includes(r));
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
              {visibleItems?.map((item: any) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || (item.items && pathname.startsWith(item.url))}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.items && pathname.startsWith(item.url) && (
                    <div className="pl-6 pt-2 pb-1 space-y-1 group-data-[collapsible=icon]:hidden overflow-hidden transition-all duration-200">
                      {item.items.map((subItem: any) => {
                        const currentStatus = searchParams.get("status") || "on-queue";
                        const subItemStatus = new URLSearchParams(subItem.url.split('?')[1]).get("status");
                        const isSubActive = currentStatus === subItemStatus;
                          
                        return (
                          <Link 
                            key={subItem.title} 
                            href={subItem.url}
                            className={`block text-sm px-2 py-1.5 rounded-md transition-colors ${
                              isSubActive 
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
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
