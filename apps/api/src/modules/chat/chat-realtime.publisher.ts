import { Injectable } from "@nestjs/common";
import type { Server } from "socket.io";
import type { RoomsChangedReason } from "./types/rooms-changed.type";
import { userSocketRoomId } from "./chat.constants";

@Injectable()
export class ChatRealtimePublisher {
  private server: Server | null = null;

  registerServer(server: Server): void {
    this.server = server;
  }

  notifyRoomsChanged(
    userIds: string[],
    reason: RoomsChangedReason,
    roomId: string,
    updatedAt: Date,
  ): void {
    if (!this.server || userIds.length === 0) {
      return;
    }
    const payload = {
      type: "rooms:changed" as const,
      reason,
      roomId,
      updatedAt: updatedAt.toISOString(),
    };
    const unique = [...new Set(userIds)];
    for (const uid of unique) {
      this.server.to(userSocketRoomId(uid)).emit("rooms:changed", payload);
    }
  }
}
