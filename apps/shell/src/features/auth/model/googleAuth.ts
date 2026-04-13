import type { AuthMode, UserRole } from "@/entities/user";
import { API_BASE_URL } from "@/shared/api";

type StartGoogleAuthParams = {
  role: UserRole;
  mode: AuthMode;
};

const GOOGLE_AUTH_MISSING_API_URL =
  "Google sign-in requires VITE_API_URL to point at the API (OAuth lives at /auth/google on the backend). Set it in .env — see apps/shell/.env.example.";

function resolveGoogleAuthBaseUrl(): string {
  if (API_BASE_URL) {
    return API_BASE_URL;
  }
  if (import.meta.env.DEV) {
    throw new Error(GOOGLE_AUTH_MISSING_API_URL);
  }
  console.error(`[googleAuth] ${GOOGLE_AUTH_MISSING_API_URL}`);
  return "";
}

export function startGoogleAuth({ role, mode }: StartGoogleAuthParams): void {
  const baseUrl = resolveGoogleAuthBaseUrl();
  if (!baseUrl) {
    return;
  }

  const params = new URLSearchParams({
    role,
    mode,
  });

  window.location.assign(`${baseUrl}/auth/google?${params.toString()}`);
}
