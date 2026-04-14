import { Injectable } from "@nestjs/common";
import { throttleDefaultsFromEnv } from "../../config/throttle.config";

@Injectable()
export class ChatSocketThrottleService {
  private readonly timestampsByUser = new Map<string, number[]>();

  allowMessageSend(userId: string): boolean {
    const { ttlMs, limit } = throttleDefaultsFromEnv();
    const now = Date.now();
    const cut = now - ttlMs;
    let arr = this.timestampsByUser.get(userId);
    if (!arr) {
      arr = [];
    }
    while (arr.length > 0 && arr[0]! <= cut) {
      arr.shift();
    }
    if (arr.length === 0) {
      this.timestampsByUser.delete(userId);
    }
    if (arr.length >= limit) {
      this.timestampsByUser.set(userId, arr);
      return false;
    }
    arr.push(now);
    this.timestampsByUser.set(userId, arr);
    return true;
  }
}
