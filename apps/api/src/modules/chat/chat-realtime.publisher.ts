import { Injectable } from "@nestjs/common";
import type { Server } from "socket.io";
import type {
  RoomsChangedPayload,
  RoomsChangedReason,
} from "./types/rooms-changed.type";
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
    const unique = [...new Set(userIds)];
    const payload: RoomsChangedPayload = {
      type: "rooms:changed",
      reason,
      roomId,
      updatedAt: updatedAt.toISOString(),
    };
    let target = this.server.to(userSocketRoomId(unique[0]!));
    for (let i = 1; i < unique.length; i++) {
      target = target.to(userSocketRoomId(unique[i]!));
    }
    target.emit("rooms:changed", payload);
  }
}
