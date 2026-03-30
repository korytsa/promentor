import type { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

export function createCorsOptions(): CorsOptions {
  const configuredCorsOrigins =
    process.env.CORS_ORIGIN?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const isDev = process.env.NODE_ENV !== "production";
  const fallbackDevOrigins = ["http://localhost:5173", "http://localhost:3000"];
  const corsOrigins =
    configuredCorsOrigins.length > 0
      ? configuredCorsOrigins
      : isDev
        ? fallbackDevOrigins
        : [];

  return {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
  };
}
