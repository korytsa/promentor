import type { AuthMode, UserRole } from "@/entities/user";
import { API_BASE_URL } from "@/shared/api";

type StartGoogleAuthParams = {
  role: UserRole;
  mode: AuthMode;
};

function resolveGoogleAuthBaseUrl(): string {
  if (API_BASE_URL) {
    return API_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
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
