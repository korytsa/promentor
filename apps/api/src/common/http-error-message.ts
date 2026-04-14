import { HttpException } from "@nestjs/common";

export function getErrorMessageFromUnknown(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof HttpException) {
    const res = error.getResponse();
    if (typeof res === "string") {
      return res;
    }
    if (typeof res === "object" && res !== null && "message" in res) {
      const m = (res as { message: string | string[] }).message;
      return Array.isArray(m) ? (m[0] ?? fallback) : m;
    }
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}
