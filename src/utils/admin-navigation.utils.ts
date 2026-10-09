import type { NavItem } from "@/routes/types";

/** Flatten a nested admin nav tree into every reachable URL (parents + children). */
export function flattenAdminRoutes(items: NavItem[]): string[] {
  const urls: string[] = [];
  for (const item of items) {
    urls.push(item.url);
    if (item.items) {
      for (const sub of item.items) urls.push(sub.url);
    }
  }
  return [...new Set(urls)];
}

function stripQuery(url: string): string {
  return url.split("?")[0] as string;
}

/** True when `pathname` belongs to `itemUrl` (exact match or nested child). */
export function isAdminRouteActive(pathname: string, itemUrl: string): boolean {
  const cleanItem = stripQuery(itemUrl);
  if (pathname === cleanItem) return true;
  return pathname.startsWith(`${cleanItem}/`);
}

/** Breadcrumb segments for `/system/...` paths, e.g. `["Staff", "[id]"]`. */
export function getAdminBreadcrumbs(pathname: string): string[] {
  return pathname
    .replace(/^\/system\/?/, "")
    .split("/")
    .filter(Boolean)
    .map((seg) => seg.replace(/-/g, " "))
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1));
}

/** Remove `undefined` / `""` values before handing params to `ofetch`. */
export function cleanParams<T extends object>(
  params?: T,
): Record<string, string | number> | undefined {
  if (params == null) return undefined;
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") out[key] = value as string | number;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
