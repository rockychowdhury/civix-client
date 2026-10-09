import { History, ListTodo, User } from "lucide-react";
import type { NavItem } from "./types";

export const technicianRoutes: NavItem[] = [
  {
    title: "My Queue",
    url: "/technician/queue",
    icon: ListTodo,
    permission: "workorder:read",
    items: [
      { title: "Today's Queue", url: "/technician/queue?filter=today" },
      { title: "This Week", url: "/technician/queue?filter=week" },
      { title: "All Upcoming", url: "/technician/queue?filter=all" },
    ],
  },
  {
    title: "Completed",
    url: "/technician/history",
    icon: History,
    permission: "workorder:read",
  },
  {
    title: "Profile",
    url: "/technician/profile",
    icon: User,
  },
];
