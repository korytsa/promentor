import type { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

const LOCAL_DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4174",
  "http://localhost:4175",
] as const;

function getEffectiveCorsOrigins(): string[] {
  const configured =
    process.env.CORS_ORIGIN?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  if (process.env.NODE_ENV === "production") {
    return configured.length > 0 ? configured : [];
  }

  return [...new Set([...configured, ...LOCAL_DEV_ORIGINS])];
}

export function isCorsOriginAllowed(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }
  const corsOrigins = getEffectiveCorsOrigins();
  return corsOrigins.length > 0 && corsOrigins.includes(origin);
}

function corsOriginResolver(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  callback(null, isCorsOriginAllowed(origin));
}

export function createCorsOptions(): CorsOptions {
  return {
    origin: corsOriginResolver,
    credentials: true,
  };
}

export const socketIoCors = {
  origin: corsOriginResolver,
  credentials: true,
};
