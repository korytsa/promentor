export interface OkResponse {
  ok: boolean;
  message: string;
}

export function ok(message: string): OkResponse {
  return {
    ok: true,
    message,
  };
}

export function withMessage<T extends object>(
  data: T,
  message: string,
): T & { message: string } {
  return {
    ...data,
    message,
  };
}
