import { createHash } from "crypto";
import { Request, Response } from "express";
import {
  JWT_ACCESS_EXPIRES_IN_SECONDS,
  JWT_REFRESH_EXPIRES_IN_DAYS,
} from "../config/auth-session.config";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "../constants/auth-cookies.constants";

const isProd = process.env.NODE_ENV === "production";

export function getCookieValue(req: Request, name: string): string | undefined {
  const value = req.cookies?.[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function baseCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  domain?: string;
} {
  const sameSite =
    (process.env.COOKIE_SAME_SITE as "lax" | "strict" | "none" | undefined) ??
    "lax";
  const domain = process.env.COOKIE_DOMAIN?.trim() || undefined;
  return {
    httpOnly: true,
    secure: isProd,
    sameSite,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  rawRefreshToken: string,
): void {
  const opts = baseCookieOptions();

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...opts,
    maxAge: JWT_ACCESS_EXPIRES_IN_SECONDS * 1000,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, rawRefreshToken, {
    ...opts,
    maxAge: JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  const opts = baseCookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE, opts);
  res.clearCookie(REFRESH_TOKEN_COOKIE, opts);
}

export function hashRefreshToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
