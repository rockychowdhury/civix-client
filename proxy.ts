import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  accessTokenCookie,
  accessTokenMaxAgeSeconds,
  refreshTokenCookie,
  refreshTokenMaxAgeSeconds,
} from "@/lib/auth/cookies";
import { jwtUtils, type TokenData } from "@/lib/utils/jwt";
import { getNewAccessToken } from "@/services/refresh-token.service";

const AUTH_ROUTES = ["/login", "/register", "/verify", "/forgot-password", "/reset-password"];
const PUBLIC_ROUTES = ["/"]; // Should match any fully public unauthenticated pages

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isSecureCookie = process.env.NODE_ENV === "production";

  let accessToken = request.cookies.get(accessTokenCookie)?.value;
  const refreshToken = request.cookies.get(refreshTokenCookie)?.value;

  let decodedAccessToken = accessToken ? jwtUtils.verifyAccessToken(accessToken) : null;
  const decodedRefreshToken = refreshToken ? jwtUtils.verifyRefreshToken(refreshToken) : null;

  let newlyRefreshedTokens: { accessToken: string; refreshToken: string } | null = null;

  if (!decodedAccessToken?.success && decodedRefreshToken?.success) {
    // access token has expired but refresh token is valid, get new access token from backend
    const result = await getNewAccessToken(refreshToken as string);

    if (result) {
      newlyRefreshedTokens = result;
      accessToken = result.accessToken;
      decodedAccessToken = jwtUtils.verifyAccessToken(accessToken);
    }
  }

  let userRoles: string[] = [];

  if (!decodedAccessToken?.success) {
    // token has expired or is invalid, handled at the end by deleting cookie
  } else if (decodedAccessToken.data) {
    const data = decodedAccessToken.data as TokenData & { role?: string };
    if (typeof data !== "string") {
      if (Array.isArray(data.roles)) {
        userRoles = data.roles.filter((role): role is string => typeof role === "string");
      } else if (typeof data.role === "string") {
        userRoles = [data.role];
      }
    }
  }

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const isApiProxy = pathname.startsWith("/api/proxy");

  let finalResponse: NextResponse;

  // User is logged in with valid token and trying to access login or register page -> redirect to dashboard
  if (decodedAccessToken?.success && userRoles.length > 0 && isAuthRoute) {
    if (userRoles.includes("SUPER_ADMIN") || userRoles.includes("PLATFORM_ADMIN")) {
      finalResponse = NextResponse.redirect(new URL("/system-dashboard", request.url));
    } else if (userRoles.includes("CITY_ADMIN")) {
      finalResponse = NextResponse.redirect(new URL("/municipality-dashboard", request.url));
    } else if (userRoles.includes("DEPARTMENT_MANAGER") || userRoles.includes("DISPATCHER")) {
      finalResponse = NextResponse.redirect(new URL("/department-dashboard", request.url));
    } else if (userRoles.includes("TECHNICIAN")) {
      finalResponse = NextResponse.redirect(new URL("/technician-dashboard", request.url));
    } else if (userRoles.includes("CITIZEN")) {
      finalResponse = NextResponse.redirect(new URL("/citizen-dashboard", request.url));
    } else {
      finalResponse = NextResponse.redirect(new URL("/", request.url));
    }
  }
  // Authenticated Pages Protection
  else if (
    (!accessToken || !decodedAccessToken?.success) &&
    !isPublicRoute &&
    !isAuthRoute &&
    !isApiProxy
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    finalResponse = NextResponse.redirect(loginUrl);
  }
  // Authorization: Role based access control
  else if (
    pathname.includes("system-dashboard") &&
    !userRoles.some((r) => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(r))
  ) {
    finalResponse = NextResponse.redirect(new URL("/not-found", request.url));
  } else if (pathname.includes("municipality-dashboard") && !userRoles.includes("CITY_ADMIN")) {
    finalResponse = NextResponse.redirect(new URL("/not-found", request.url));
  } else if (
    pathname.includes("department-dashboard") &&
    !userRoles.some((r) => ["DEPARTMENT_MANAGER", "DISPATCHER"].includes(r))
  ) {
    finalResponse = NextResponse.redirect(new URL("/not-found", request.url));
  } else if (pathname.includes("technician-dashboard") && !userRoles.includes("TECHNICIAN")) {
    finalResponse = NextResponse.redirect(new URL("/not-found", request.url));
  } else if (pathname.includes("citizen-dashboard") && !userRoles.includes("CITIZEN")) {
    finalResponse = NextResponse.redirect(new URL("/not-found", request.url));
  } else {
    // Forward cookies if they were refreshed during an API proxy request
    if (newlyRefreshedTokens && isApiProxy) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(
        "Cookie",
        request.cookies
          .getAll()
          .map((c) => {
            if (c.name === accessTokenCookie)
              return `${c.name}=${newlyRefreshedTokens!.accessToken}`;
            if (c.name === refreshTokenCookie)
              return `${c.name}=${newlyRefreshedTokens!.refreshToken}`;
            return `${c.name}=${c.value}`;
          })
          .join("; "),
      );
      finalResponse = NextResponse.next({ request: { headers: requestHeaders } });
    } else {
      finalResponse = NextResponse.next();
    }
  }

  // Apply cookie changes to the response
  if (newlyRefreshedTokens) {
    finalResponse.cookies.set({
      name: accessTokenCookie,
      value: newlyRefreshedTokens.accessToken,
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: "lax",
      maxAge: accessTokenMaxAgeSeconds,
      path: "/",
    });
    finalResponse.cookies.set({
      name: refreshTokenCookie,
      value: newlyRefreshedTokens.refreshToken,
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: "lax",
      maxAge: refreshTokenMaxAgeSeconds,
      path: "/",
    });
  } else if (!decodedAccessToken?.success && !decodedRefreshToken?.success) {
    finalResponse.cookies.delete(accessTokenCookie);
  }

  return finalResponse;
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)",
  ],
};
