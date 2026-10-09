import {
  Building2,
  Eye,
  Home,
  Map as MapIcon,
  MessageSquareHeart,
  Tags,
  UserPlus,
  Users,
} from "lucide-react";
import type { NavItem } from "./types";

/**
 * City Admin portal (`/municipality`) — one city, fully scoped.
 * Every view takes its municipalityId from useCityScope(); staff lists are
 * additionally auto-scoped server-side for CITY_ADMIN.
 */
export const cityRoutes: NavItem[] = [
  {
    title: "Overview",
    url: "/municipality/overview",
    icon: Home,
    permission: "municipality:read",
  },
  {
    title: "Departments",
    url: "/municipality/departments",
    icon: Building2,
    permission: "department:read",
    items: [
      { title: "Departments", url: "/municipality/departments" },
      { title: "Teams", url: "/municipality/departments/teams" },
    ],
  },
  {
    title: "Staff",
    url: "/municipality/staff",
    icon: UserPlus,
    permission: "staff:read",
    items: [
      { title: "All Staff", url: "/municipality/staff" },
      { title: "Managers", url: "/municipality/staff?role=DEPARTMENT_MANAGER" },
      { title: "Dispatchers", url: "/municipality/staff?role=DISPATCHER" },
      { title: "Technicians", url: "/municipality/staff?role=TECHNICIAN" },
    ],
  },
  {
    title: "Jurisdiction",
    url: "/municipality/zones",
    icon: MapIcon,
    permission: "zone:read",
    items: [
      { title: "Zones", url: "/municipality/zones" },
      { title: "Wards", url: "/municipality/wards" },
    ],
  },
  {
    title: "Issues",
    url: "/municipality/issues",
    icon: Eye,
    permission: "oversight:read",
  },
  {
    title: "Requests",
    url: "/municipality/requests",
    icon: Users,
    permission: "oversight:read",
  },
  {
    title: "Categories & SLA",
    url: "/municipality/categories",
    icon: Tags,
    permission: "category:read",
    items: [
      { title: "Categories", url: "/municipality/categories" },
      { title: "SLA Policies", url: "/municipality/sla-policies" },
    ],
  },
  {
    title: "Feedback",
    url: "/municipality/feedback",
    icon: MessageSquareHeart,
    permission: "oversight:read",
  },
];
