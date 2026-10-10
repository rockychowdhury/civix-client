import { FileText, Home, PlusCircle, Star, User } from "lucide-react";
import type { NavItem } from "./types";

export const citizenRoutes: NavItem[] = [
  { title: "Overview", url: "/citizen/overview", icon: Home },
  { title: "My Reports", url: "/citizen/my-reports", icon: FileText },
  { title: "Feedback", url: "/citizen/feedback", icon: Star },
  { title: "Profile", url: "/citizen/profile", icon: User },
];
