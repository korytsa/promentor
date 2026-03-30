import type { Method } from "axios";
import { ApiError, requestWithAutoRefresh } from "./http";
import { getMessageFromResponseData } from "./parseError";

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

  return requestWithAutoRefresh({
    url,
    method,
    data: method === "GET" || method === "HEAD" ? undefined : options?.body,
    headers: headersToRecord(options?.headers),
    signal: options?.signal as AbortSignal | undefined,
  }).then((res) => {
    if (isAuthMe && res.status === 401) {
      return {
        data: undefined as void,
        status: 401,
        headers: res.headers,
      } as T;
    }

    if (res.status < 200 || res.status >= 300) {
      const message = getMessageFromResponseData(res.data);
      return Promise.reject(new ApiError(message, res.status));
    }

    return {
      data: res.data,
      status: res.status,
      headers: res.headers,
    } as T;
  });
}
