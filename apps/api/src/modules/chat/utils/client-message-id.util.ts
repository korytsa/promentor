import { BadRequestException } from "@nestjs/common";
import { CHAT_CLIENT_MESSAGE_ID_MAX_LENGTH } from "../chat.constants";

/**
 * Correlation id for optimistic UI — not stored in DB.
 * Accepts optional string from REST DTO or WebSocket payload; rejects invalid types/length.
 */
export function parseClientMessageIdForSend(raw: unknown): string | undefined {
  if (raw === undefined || raw === null) {
    return undefined;
  }
  if (typeof raw !== "string") {
    throw new BadRequestException("clientMessageId must be a string");
  }
  const t = raw.trim();
  if (t.length === 0) {
    return undefined;
  }
  if (t.length > CHAT_CLIENT_MESSAGE_ID_MAX_LENGTH) {
    throw new BadRequestException(
      `clientMessageId cannot exceed ${CHAT_CLIENT_MESSAGE_ID_MAX_LENGTH} characters`,
    );
  }
  return t;
}
