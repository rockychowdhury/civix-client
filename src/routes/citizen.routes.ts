import { FileText, Home, User } from "lucide-react";
import type { NavItem } from "./types";

export const citizenRoutes: NavItem[] = [
  { title: "Overview", url: "/citizen/overview", icon: Home },
  { title: "My Reports", url: "/citizen/my-reports", icon: FileText },
  { title: "Profile", url: "/citizen/profile", icon: User },
];
