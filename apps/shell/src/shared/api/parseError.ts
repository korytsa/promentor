export function getMessageFromResponseData(data: unknown): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (Array.isArray(m)) {
      const joined = m
        .filter((x): x is string => typeof x === "string")
        .join(", ");
      if (joined.length > 0) {
        return joined;
      }
    }
    if (typeof m === "string" && m.length > 0) {
      return m;
    }
  }
  if (typeof data === "object" && data !== null && "error" in data) {
    const e = (data as { error: unknown }).error;
    if (typeof e === "string" && e.length > 0) {
      return e;
    }
  }
  return "Request failed";
}
