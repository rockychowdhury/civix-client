import { History, Home, Inbox, User, Wrench } from "lucide-react";
import type { NavItem } from "./types";

/**
 * Technician portal — mirrors the field operations workflow:
 * Overview (shift status & KPIs) → Work Orders (direct execution) → Inbox (dispatched) → History (resolved) → Profile
 */
export const technicianRoutes: NavItem[] = [
  {
    title: "Overview",
    url: "/technician/overview",
    icon: Home,
    permission: "workorder:read",
  },
  {
    title: "Work Orders",
    url: "/technician/work-orders",
    icon: Wrench,
    permission: "workorder:read",
    items: [
      { title: "Active Jobs", url: "/technician/work-orders?stage=active" },
      { title: "Pending Start", url: "/technician/work-orders?stage=pending" },
      { title: "Under Verification", url: "/technician/work-orders?stage=verification" },
      { title: "Completed", url: "/technician/work-orders?stage=completed" },
    ],
  },
  {
    title: "Assignments Inbox",
    url: "/technician/inbox",
    icon: Inbox,
    permission: "workorder:read",
  },
  {
    title: "Resolution History",
    url: "/technician/history",
    icon: History,
    permission: "workorder:read",
  },
  {
    title: "Profile & Shift",
    url: "/technician/profile",
    icon: User,
  },
];
