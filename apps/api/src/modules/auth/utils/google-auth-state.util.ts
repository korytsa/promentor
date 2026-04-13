import { UserRole } from "@prisma/client";
import { createHmac, timingSafeEqual } from "crypto";

export type GoogleAuthMode = "login" | "register";

export type GoogleAuthState = {
  role: UserRole;
  mode: GoogleAuthMode;
};

type GoogleAuthStatePayload = GoogleAuthState & {
  iat: number;
  exp: number;
};

const DEFAULT_GOOGLE_AUTH_STATE: GoogleAuthState = {
  role: UserRole.REGULAR_USER,
  mode: "login",
};

const GOOGLE_STATE_TTL_SECONDS = 5 * 60;

function normalizeRole(value: unknown): UserRole {
  if (value === UserRole.MENTOR || value === UserRole.REGULAR_USER) {
    return value;
  }
  return DEFAULT_GOOGLE_AUTH_STATE.role;
}

function normalizeMode(value: unknown): GoogleAuthMode {
  return value === "register" ? "register" : "login";
}

export function getRoleParam(role: UserRole): string {
  return role === UserRole.MENTOR ? "mentor" : "regular_user";
}

function toBase64Url(raw: string): string {
  return Buffer.from(raw, "utf8").toString("base64url");
}

function fromBase64Url(raw: string): string {
  return Buffer.from(raw, "base64url").toString("utf8");
}

function getGoogleStateSecret(): string {
  return (
    process.env.GOOGLE_STATE_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    "dev-google-state-secret"
  );
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", getGoogleStateSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function isValidSignature(encodedPayload: string, signature: string): boolean {
  const expected = signPayload(encodedPayload);
  const expectedBuffer = Buffer.from(expected);
  const incomingBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== incomingBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, incomingBuffer);
}

export function encodeGoogleAuthState(raw: {
  role?: unknown;
  mode?: unknown;
}): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload: GoogleAuthStatePayload = {
    role: normalizeRole(raw.role),
    mode: normalizeMode(raw.mode),
    iat: nowSeconds,
    exp: nowSeconds + GOOGLE_STATE_TTL_SECONDS,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function decodeGoogleAuthState(state: unknown): GoogleAuthState {
  if (typeof state !== "string" || state.length === 0) {
    return DEFAULT_GOOGLE_AUTH_STATE;
  }

  try {
    const [encodedPayload, signature] = state.split(".");
    if (!encodedPayload || !signature) {
      return DEFAULT_GOOGLE_AUTH_STATE;
    }

    if (!isValidSignature(encodedPayload, signature)) {
      return DEFAULT_GOOGLE_AUTH_STATE;
    }

    const decoded = JSON.parse(fromBase64Url(encodedPayload)) as {
      role?: unknown;
      mode?: unknown;
      exp?: unknown;
    };

    if (typeof decoded.exp !== "number") {
      return DEFAULT_GOOGLE_AUTH_STATE;
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp < nowSeconds) {
      return DEFAULT_GOOGLE_AUTH_STATE;
    }

    return {
      role: normalizeRole(decoded.role),
      mode: normalizeMode(decoded.mode),
    };
  } catch {
    return DEFAULT_GOOGLE_AUTH_STATE;
  }
}
