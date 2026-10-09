export { cn } from "cn";

/**
 * Safely format a ward string, number, or object into a human-readable display string.
 * Prevents React child rendering errors when ward relations are returned as objects {name, number}.
 */
export function formatWard(ward: unknown): string {
  if (ward == null) return "—";
  if (typeof ward === "string" || typeof ward === "number") {
    const s = String(ward).trim();
    if (!s) return "—";
    return s.toLowerCase().startsWith("ward") ? s : `Ward ${s}`;
  }
  if (typeof ward === "object") {
    const w = ward as { name?: string; number?: number | string; code?: string };
    if (w.name) {
      const s = String(w.name).trim();
      return s.toLowerCase().startsWith("ward") ? s : `Ward ${s}`;
    }
    if (w.number != null) return `Ward ${w.number}`;
    if (w.code != null) return `Ward ${w.code}`;
  }
  return "—";
}

/**
 * Safely format a zone string, number, or object into a human-readable display string.
 * Prevents React child rendering errors when zone relations are returned as objects.
 */
export function formatZone(zone: unknown): string {
  if (zone == null) return "—";
  if (typeof zone === "string" || typeof zone === "number") {
    const s = String(zone).trim();
    if (!s) return "—";
    return s.toLowerCase().startsWith("zone") ? s : `Zone ${s}`;
  }
  if (typeof zone === "object") {
    const z = zone as { name?: string; code?: string; number?: number | string };
    if (z.name) {
      const s = String(z.name).trim();
      return s.toLowerCase().startsWith("zone") ? s : `Zone ${s}`;
    }
    if (z.code != null) return `Zone ${z.code}`;
    if (z.number != null) return `Zone ${z.number}`;
  }
  return "—";
}
