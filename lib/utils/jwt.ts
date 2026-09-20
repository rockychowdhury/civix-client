import "server-only";

import jwt from "jsonwebtoken";

import { env } from "@/lib/config/env";

type TokenData = string | jwt.JwtPayload;

type TokenVerified = {
  success: true;
  data: TokenData;
};

type TokenFailed = {
  success: false;
  error: string;
};

type TokenVerifyResult = TokenVerified | TokenFailed;

function verifyToken(token: string, secret: string): TokenVerifyResult {
  try {
    const data = jwt.verify(token, secret);
    return {
      success: true,
      data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Token verification failed";
    console.warn("[jwt] Token verification failed:", message);
    return {
      success: false,
      error: message,
    };
  }
}

export const jwtUtils = {
  verifyToken,
  verifyAccessToken(token: string) {
    return verifyToken(token, env.jwt.accessSecret);
  },
  verifyRefreshToken(token: string) {
    return verifyToken(token, env.jwt.refreshSecret);
  },
};

export type { TokenData, TokenVerifyResult };
