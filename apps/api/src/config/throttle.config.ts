export function throttleDefaultsFromEnv(): { ttlMs: number; limit: number } {
  const ttl = Number(process.env.THROTTLE_TTL_MS);
  const limit = Number(process.env.THROTTLE_LIMIT);
  return {
    ttlMs: Number.isFinite(ttl) && ttl > 0 ? ttl : 60_000,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 30,
  };
}

export function throttlerOptionsFromEnv() {
  const { ttlMs, limit } = throttleDefaultsFromEnv();
  return [{ ttl: ttlMs, limit }];
}
