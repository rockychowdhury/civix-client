import "server-only";

import { cookies } from "next/headers";

import { accessTokenCookie } from "@/lib/auth/cookies";
import { env } from "@/lib/config/env";
import { jwtUtils } from "@/lib/utils/jwt";

export type MeResponse = {
  id: string;
  email: string;
  phone: string | null;
  status: string;
  isEmailVerified: boolean;
  deletedAt: string | null;
  citizenProfile: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  } | null;
  staffProfile: unknown;
  userRoles: Array<{ role: { name: string } }> | null;
};

type CookieStore = Awaited<ReturnType<typeof cookies>>;

import { unstable_cache } from "next/cache";

const getCachedUser = unstable_cache(
  async (token: string, cookieString: string): Promise<MeResponse | null> => {
    try {
      const response = await fetch(`${env.apiUrl}/users/me`, {
        cache: "no-store",
        headers: {
          Cookie: cookieString,
        },
      });

      if (!response.ok) return null;

      const body = (await response.json()) as {
        success: boolean;
        data: MeResponse;
      };

      return body.success ? body.data : null;
    } catch {
      return null;
    }
  },
  ["user-profile"],
  {
    revalidate: 60, // Revalidate in background every 60 seconds
    tags: ["user-profile"],
  }
);

export async function getUser(cookieStore?: CookieStore): Promise<MeResponse | null> {
  const store = cookieStore ?? (await cookies());
  const accessToken = store.get(accessTokenCookie)?.value;
  if (!accessToken) return null;

  const verification = jwtUtils.verifyAccessToken(accessToken);
  if (!verification.success) return null;

  return getCachedUser(accessToken, store.toString());
}

export function getUserDisplayName(user: Pick<MeResponse, "email" | "citizenProfile">): string {
  if (user.citizenProfile?.firstName) {
    return [user.citizenProfile.firstName, user.citizenProfile.lastName].filter(Boolean).join(" ");
  }
  return user.email;
}

export function getUserRoles(user: Pick<MeResponse, "userRoles">): string[] {
  return user.userRoles?.map((userRole) => userRole.role.name) ?? [];
}
