import type { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

export function createCorsOptions(): CorsOptions {
  const corsOrigins =
    process.env.CORS_ORIGIN?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  return {
    origin: (origin, callback) => {
      if (!corsOrigins.length) {
        return callback(null, true);
      }
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
