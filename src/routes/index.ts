import { citizenRoutes } from "./citizen.routes";
import { technicianRoutes } from "./technician.routes";
import { departmentRoutes } from "./department.routes";
import { municipalityRoutes } from "./municipality.routes";
import { systemRoutes } from "./system.routes";
import type { NavItem } from "./types";

export const NAV_CONFIG: Record<string, NavItem[]> = {
  "/citizen": citizenRoutes,
  "/technician": technicianRoutes,
  "/department": departmentRoutes,
  "/municipality": municipalityRoutes,
  "/system": systemRoutes,
};

export * from "./types";
export * from "./citizen.routes";
export * from "./technician.routes";
export * from "./department.routes";
export * from "./municipality.routes";
export * from "./system.routes";
