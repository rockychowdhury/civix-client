"use client";

import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { useCityScope } from "@/hooks/city.hook";

type ScopedChildProps = {
  municipalityId?: string;
};

/**
 * Resolves the city admin's municipality before mounting scoped views,
 * so scoped queries always fire with a defined municipalityId.
 *
 * NOTE: pages in `src/app` are Server Components, so children must be
 * serializable React elements — NOT render-prop functions. Passing an
 * inline function (e.g. `{(scope) => <View municipalityId={scope} />}`)
 * from a Server Component to this Client Component throws:
 * "Functions are not valid as a child of Client Components."
 *
 * Usage (in a Server page):
 *   <CityScopeGate><ZonesView /></CityScopeGate>
 * The gate clones the child element and injects the resolved municipalityId.
 */
export function CityScopeGate({
  children,
  fallback,
}: {
  children: ReactElement<ScopedChildProps>;
  fallback?: ReactNode;
}) {
  const scope = useCityScope();
  if (!scope) return <>{fallback ?? <AdminSectionSkeleton />}</>;
  if (isValidElement<ScopedChildProps>(children)) {
    return <>{cloneElement(children, { municipalityId: scope })}</>;
  }
  return <>{children as ReactNode}</>;
}
