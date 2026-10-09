import { adminRoutes } from "./admin.routes";

/**
 * The Super Admin / Platform Admin portal lives at `/system`.
 * The canonical nested definition lives in `admin.routes.ts` — re-exported
 * here so `NAV_CONFIG["/system"]` stays in sync without duplication.
 */
export const systemRoutes = adminRoutes;
