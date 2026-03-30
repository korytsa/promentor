export const JWT_ACCESS_EXPIRES_IN_SECONDS = Number(
  process.env.JWT_ACCESS_EXPIRES_IN_SECONDS ?? 900,
);

export const JWT_REFRESH_EXPIRES_IN_DAYS = Number(
  process.env.JWT_REFRESH_EXPIRES_DAYS ?? 7,
);
