import { Injectable } from "@nestjs/common";
import { throttleDefaultsFromEnv } from "../../config/throttle.config";

/** In-memory rate limit for Socket.IO message sends (same window as REST throttler defaults). */
@Injectable()
export class ChatSocketThrottleService {
  private readonly timestampsByUser = new Map<string, number[]>();

  allowMessageSend(userId: string): boolean {
    const { ttlMs, limit } = throttleDefaultsFromEnv();
    const now = Date.now();
    const windowStart = now - ttlMs;
    const prev = this.timestampsByUser.get(userId) ?? [];
    const next = prev.filter((t) => t > windowStart);
    if (next.length >= limit) {
      return false;
    }
    next.push(now);
    this.timestampsByUser.set(userId, next);
    return true;
  }
}
