"use client";

import { useGetMe } from "@/hooks/auth.hook";

/**
 * The municipality this City Admin governs. Sourced from the staff profile —
 * every city view scopes its queries with it. `undefined` while auth loads.
 */
export function useCityScope(): string | undefined {
  const { data } = useGetMe();
  const user = data?.data as
    | { staffProfile?: { municipalityId?: string | null } | null }
    | undefined;
  return user?.staffProfile?.municipalityId ?? undefined;
}
