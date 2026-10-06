import { History, ListTodo, User } from "lucide-react";
import type { NavItem } from "./types";

export const technicianRoutes: NavItem[] = [
  { title: "Today's Queue", url: "/technician/queue", icon: ListTodo },
  { title: "Completed", url: "/technician/history", icon: History },
  { title: "Profile", url: "/technician/profile", icon: User },
];
