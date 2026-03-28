import type { Method } from "axios";
import { apiClient } from "./http";

function headersToRecord(
  headers?: HeadersInit,
): Record<string, string> | undefined {
  if (!headers) {
    return undefined;
  }
  return Object.fromEntries(new Headers(headers).entries());
}

export function customInstance<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase() as Method;

  const isAuthMe = url === "/auth/me" || url.endsWith("/auth/me");

  return apiClient
    .request({
      url,
      method,
      data: method === "GET" || method === "HEAD" ? undefined : options?.body,
      headers: headersToRecord(options?.headers),
      signal: options?.signal as AbortSignal | undefined,
      validateStatus: isAuthMe
        ? (status) => status === 200 || status === 401
        : undefined,
    })
    .then((res) => {
      if (isAuthMe && res.status === 401) {
        return {
          data: undefined as void,
          status: 401,
          headers: res.headers,
        } as T;
      }
      return {
        data: res.data,
        status: res.status,
        headers: res.headers,
      } as T;
    });
}
