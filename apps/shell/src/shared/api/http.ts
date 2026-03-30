import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { getMessageFromResponseData } from "./parseError";

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data !== undefined
        ? getMessageFromResponseData(error.response.data)
        : error.message || "Network error";
    return Promise.reject(new ApiError(message, status));
  },
);

const AUTH_REFRESH_URL = "/auth/refresh";
const AUTH_PATHS_WITHOUT_AUTO_REFRESH = [
  AUTH_REFRESH_URL,
  "/auth/login",
  "/auth/register",
  "/auth/logout",
] as const;

let refreshRequest: Promise<boolean> | null = null;

function isAuthPathWithoutAutoRefresh(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  return AUTH_PATHS_WITHOUT_AUTO_REFRESH.some(
    (path) => url === path || url.endsWith(path),
  );
}

async function refreshSession(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = apiClient
      .request({
        url: AUTH_REFRESH_URL,
        method: "POST",
        validateStatus: () => true,
      })
      .then((res) => res.status >= 200 && res.status < 300)
      .catch(() => false)
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

export async function requestWithAutoRefresh<T>(
  config: AxiosRequestConfig,
  hasRetried = false,
): Promise<AxiosResponse<T>> {
  const response = await apiClient.request<T>({
    ...config,
    validateStatus: () => true,
  });

  if (response.status !== 401) {
    return response;
  }

  const requestUrl = typeof config.url === "string" ? config.url : undefined;
  if (hasRetried || isAuthPathWithoutAutoRefresh(requestUrl)) {
    return response;
  }

  const refreshSucceeded = await refreshSession();
  if (!refreshSucceeded) {
    return response;
  }

  return requestWithAutoRefresh<T>(config, true);
}
