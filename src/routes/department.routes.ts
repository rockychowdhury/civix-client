import { BarChart3, CheckSquare, FileText, Home, ListTodo, UserPlus, Users } from "lucide-react";
import type { NavItem } from "./types";

export const departmentRoutes: NavItem[] = [
  { title: "Overview", url: "/department/overview", icon: Home, permission: "department:read" },
  {
    title: "Work Orders",
    url: "/department/work-orders",
    icon: CheckSquare,
    permission: "workorder:read",
    items: [
      { title: "Assign Crew", url: "/department/work-orders?status=WORK_ORDER_CREATED" },
      { title: "Active", url: "/department/work-orders?status=ASSIGNED,TEAM_ASSIGNED,IN_PROGRESS" },
      {
        title: "Resolution Verification",
        url: "/department/work-orders?status=PENDING_VERIFICATION",
      },
      { title: "Completed", url: "/department/work-orders?status=RESOLVED,CLOSED" },
    ],
  },
  {
    title: "Civic Issues",
    url: "/department/issues",
    icon: ListTodo,
    permission: "issue:read",
    items: [
      { title: "Issue Queue", url: "/department/issues?stage=queue" },
      { title: "In-Progress", url: "/department/issues?stage=in_progress" },
      { title: "Resolved", url: "/department/issues?stage=resolved" },
      { title: "Escalated", url: "/department/issues?stage=escalated" },
    ],
  },
  {
    title: "Citizen Reports",
    url: "/department/citizen-reports",
    icon: FileText,
    permission: "issue:read",
    items: [
      { title: "Request Queue", url: "/department/citizen-reports?stage=queue" },
      { title: "In-Progress", url: "/department/citizen-reports?stage=in_progress" },
      { title: "Resolved", url: "/department/citizen-reports?stage=resolved" },
      { title: "All Reports", url: "/department/citizen-reports?stage=all" },
    ],
  },
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
