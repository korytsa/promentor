import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { Server, Socket } from "socket.io";
import { ChatPresenceService } from "./chat-presence.service";
import { ChatService } from "./chat.service";
import { chatMessageToBroadcastPayload } from "./types/chat-response.type";
import { ACCESS_TOKEN_COOKIE } from "../auth/constants/auth-cookies.constants";
import { JwtPayload } from "../auth/types/jwt-payload.type";

type ChatSocket = Socket & {
  data: { userId?: string; joinedPresenceRooms?: Set<string> };
};

type RoomEventPayload = {
  roomId: string;
};

type SendMessageEventPayload = {
  roomId: string;
  message: string;
};

type TypingEventPayload = {
  roomId: string;
  typing?: boolean;
};

@WebSocketGateway({
  namespace: "/chat",
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly presence: ChatPresenceService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: ChatSocket): Promise<void> {
    try {
      const token = this.extractAccessToken(client);
      if (!token) {
        this.emitError(client, "Missing access token");
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      client.data.userId = payload.sub;
    } catch {
      this.emitError(client, "Invalid or expired token");
      client.disconnect(true);
    }
  }

  handleDisconnect(client: ChatSocket): void {
    const userId = client.data.userId;
    const joined = client.data.joinedPresenceRooms;
    if (userId && joined && joined.size > 0) {
      for (const roomId of joined) {
        const membersOnlineCount = this.presence.leave(roomId, userId);
        this.emitRoomPresence(roomId, membersOnlineCount);
      }
      joined.clear();
    }

    client.rooms.forEach((roomId) => {
      if (roomId !== client.id) {
        void client.leave(roomId);
      }
    });
  }

  @SubscribeMessage("chat:joinRoom")
  async joinRoom(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: RoomEventPayload,
  ): Promise<void> {
    try {
      const userId = this.requireUserId(client);
      const roomId = this.trimRoomId(payload.roomId);
      if (!roomId) {
        this.emitError(client, "Room id is required");
        return;
      }

      await this.chatService.assertCanAccessRoom(roomId, userId);
      await client.join(roomId);

      client.data.joinedPresenceRooms ??= new Set();
      if (!client.data.joinedPresenceRooms.has(roomId)) {
        client.data.joinedPresenceRooms.add(roomId);
        const membersOnlineCount = this.presence.join(roomId, userId);
        this.emitRoomPresence(roomId, membersOnlineCount);
      }
    } catch (error) {
      this.emitError(client, this.getErrorMessage(error));
    }
  }

  @SubscribeMessage("chat:leaveRoom")
  async leaveRoom(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: RoomEventPayload,
  ): Promise<void> {
    try {
      const roomId = this.trimRoomId(payload.roomId);
      if (!roomId) {
        this.emitError(client, "Room id is required");
        return;
      }

      const userId = this.requireUserId(client);
      await client.leave(roomId);

      if (client.data.joinedPresenceRooms?.has(roomId)) {
        client.data.joinedPresenceRooms.delete(roomId);
        const membersOnlineCount = this.presence.leave(roomId, userId);
        this.emitRoomPresence(roomId, membersOnlineCount);
      }
    } catch (error) {
      this.emitError(client, this.getErrorMessage(error));
    }
  }

  @SubscribeMessage("chat:typing")
  async typing(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: TypingEventPayload,
  ): Promise<void> {
    try {
      const userId = this.requireUserId(client);
      const roomId = this.trimRoomId(payload.roomId);
      if (!roomId) {
        this.emitError(client, "Room id is required");
        return;
      }

      await this.chatService.assertCanAccessRoom(roomId, userId);
      const typing = payload.typing !== false;

      client.to(roomId).emit("chat:typing", {
        roomId,
        userId,
        typing,
      });
    } catch (error) {
      this.emitError(client, this.getErrorMessage(error));
    }
  }

  @SubscribeMessage("chat:sendMessage")
  async sendMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: SendMessageEventPayload,
  ): Promise<void> {
    try {
      const userId = this.requireUserId(client);
      const roomId = this.trimRoomId(payload.roomId);
      if (!roomId) {
        this.emitError(client, "Room id is required");
        return;
      }

      const created = await this.chatService.sendMessage(roomId, userId, {
        message: payload.message,
      });

      this.server
        .to(roomId)
        .emit("chat:newMessage", chatMessageToBroadcastPayload(created));
    } catch (error) {
      this.emitError(client, this.getErrorMessage(error));
    }
  }

  private emitRoomPresence(roomId: string, membersOnlineCount: number): void {
    this.server.to(roomId).emit("chat:roomPresence", {
      roomId,
      membersOnlineCount,
    });
  }

  private trimRoomId(roomId: string | undefined): string | null {
    const t = roomId?.trim() ?? "";
    return t.length > 0 ? t : null;
  }

  private requireUserId(client: ChatSocket): string {
    const userId = client.data.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    return userId;
  }

  private extractAccessToken(client: ChatSocket): string | null {
    const cookieHeader = client.handshake.headers.cookie;
    if (cookieHeader) {
      const pairs = cookieHeader.split(";");
      for (const pair of pairs) {
        const [key, ...rest] = pair.trim().split("=");
        if (key === ACCESS_TOKEN_COOKIE) {
          return rest.join("=");
        }
      }
    }

    const authToken = client.handshake.auth?.token;
    return typeof authToken === "string" && authToken.length > 0
      ? authToken
      : null;
  }

  private emitError(client: ChatSocket, message: string): void {
    client.emit("chat:error", { message });
  }

  private getErrorMessage(error: unknown): string {
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    ) {
      return (error as { message: string }).message;
    }
    return "Chat event failed";
  }
}
