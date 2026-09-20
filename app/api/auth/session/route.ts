import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  accessTokenCookie,
  accessTokenMaxAgeSeconds,
  refreshTokenCookie,
  refreshTokenMaxAgeSeconds,
} from "@/lib/auth/cookies";
import { jwtUtils } from "@/lib/utils/jwt";
import { validateInput } from "@/lib/utils/validate";
import { type AuthSessionPayload, authSessionSchema } from "@/lib/validations/auth";

const isSecureCookie = process.env.NODE_ENV === "production";

function parseSessionPayload(request: Request): Promise<AuthSessionPayload | null> {
  return request
    .json()
    .then((rawBody) => {
      try {
        return validateInput(authSessionSchema, rawBody);
      } catch {
        return null;
      }
    })
    .catch(() => null);
}

export async function POST(request: Request) {
  const payload = await parseSessionPayload(request);
  if (!payload) {
    return NextResponse.json(
      { success: false, message: "Invalid session payload" },
      { status: 400 },
    );
  }

  const { accessToken, refreshToken } = payload;
  const accessValid = jwtUtils.verifyAccessToken(accessToken);
  const refreshValid = jwtUtils.verifyRefreshToken(refreshToken);
  if (!accessValid.success || !refreshValid.success) {
    return NextResponse.json({ success: false, message: "Invalid tokens" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: accessTokenCookie,
    value: accessToken,
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: "lax",
    maxAge: accessTokenMaxAgeSeconds,
    path: "/",
  });
  cookieStore.set({
    name: refreshTokenCookie,
    value: refreshToken,
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: "lax",
    maxAge: refreshTokenMaxAgeSeconds,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
