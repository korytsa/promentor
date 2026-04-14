import { Injectable } from "@nestjs/common";

@Injectable()
export class ChatPresenceService {
  private readonly roomUserRefs = new Map<string, Map<string, number>>();

  join(roomId: string, userId: string): number {
    if (!this.roomUserRefs.has(roomId)) {
      this.roomUserRefs.set(roomId, new Map());
    }
    const users = this.roomUserRefs.get(roomId)!;
    users.set(userId, (users.get(userId) ?? 0) + 1);
    return users.size;
  }

  leave(roomId: string, userId: string): number {
    const users = this.roomUserRefs.get(roomId);
    if (!users) {
      return 0;
    }
    const next = (users.get(userId) ?? 0) - 1;
    if (next <= 0) {
      users.delete(userId);
    } else {
      users.set(userId, next);
    }
    if (users.size === 0) {
      this.roomUserRefs.delete(roomId);
    }
    return users.size;
  }

  getMembersOnlineCount(roomId: string): number {
    return this.roomUserRefs.get(roomId)?.size ?? 0;
  }
}
