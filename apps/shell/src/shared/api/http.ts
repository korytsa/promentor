import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
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

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
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
