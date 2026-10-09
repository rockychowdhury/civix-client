import { History, Inbox, User, Wrench } from "lucide-react";
import type { NavItem } from "./types";

/**
 * Technician portal — mirrors the field workflow stage by stage:
 * Inbox (accept/reject) → My Work (execute) → History (done).
 */
export const technicianRoutes: NavItem[] = [
  {
    title: "Inbox",
    url: "/technician/inbox",
    icon: Inbox,
    permission: "workorder:read",
  },
  {
    title: "My Work",
    url: "/technician/queue",
    icon: Wrench,
    permission: "workorder:read",
  },
  {
    title: "History",
    url: "/technician/history",
    icon: History,
    permission: "workorder:read",
  },
  { title: "Profile", url: "/technician/profile", icon: User },
];
