import { BarChart3, CheckSquare, FileText, Home, ListTodo, Users, UserPlus } from "lucide-react";
import type { NavItem } from "./types";

export const departmentRoutes: NavItem[] = [
  { title: "Overview", url: "/department/overview", icon: Home, permission: "department:read" },
  { title: "Work Orders", url: "/department/work-orders", icon: CheckSquare, permission: "workorder:read" },
  { 
    title: "Issue Queue", 
    url: "/department/issues", 
    icon: ListTodo,
    permission: "issue:read",
    items: [
      { title: "On Queue", url: "/department/issues?status=on-queue" },
      { title: "Scheduled", url: "/department/issues?status=scheduled" },
      { title: "Pending", url: "/department/issues?status=pending" },
      { title: "All", url: "/department/issues?status=all" }
    ]
  },
  { title: "Citizen Reports", url: "/department/citizen-reports", icon: FileText, permission: "issue:read" },
  {
    title: "Staff Directory",
    url: "/department/technicians",
    icon: Users,
    permission: "technician:read",
  },
  {
    title: "Teams",
    url: "/department/teams",
    icon: Users, // Can use Users or something else, let's keep Users
    permission: "technician:manage", // Using technician:manage for team management for now
  },
  {
    title: "Add Staff",
    url: "/department/add-staff",
    icon: UserPlus,
    permission: "technician:manage",
  },
  {
    title: "Analytics",
    url: "/department/reports",
    icon: BarChart3,
    permission: "department:read",
  },
];
