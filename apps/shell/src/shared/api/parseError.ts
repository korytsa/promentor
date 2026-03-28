export function getMessageFromResponseData(data: unknown): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (Array.isArray(m)) {
      return m.filter((x): x is string => typeof x === "string").join(", ");
    }
    if (typeof m === "string") {
      return m;
    }
  }
  return "Request failed";
}
