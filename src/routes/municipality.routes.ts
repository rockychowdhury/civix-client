import { BarChart3, Building2, FileText, Home, Map, ShieldAlert } from "lucide-react";
import type { NavItem } from "./types";

export const municipalityRoutes: NavItem[] = [
  { title: "Overview", url: "/municipality/overview", icon: Home },
  { title: "Departments", url: "/municipality/departments", icon: Building2 },
  { title: "Categories & Routing", url: "/municipality/categories", icon: FileText },
  { title: "Wards & Zones", url: "/municipality/wards-zones", icon: Map },
  { title: "Analytics", url: "/municipality/analytics", icon: BarChart3 },
  { title: "Audit Log", url: "/municipality/audit-log", icon: ShieldAlert },
];
