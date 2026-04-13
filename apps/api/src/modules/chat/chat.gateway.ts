import { UnauthorizedException } from "@nestjs/common";
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
import { getErrorMessageFromUnknown } from "../../common/http-error-message";
import { socketIoCors } from "../../config/cors.config";
import { ACCESS_TOKEN_COOKIE } from "../auth/constants/auth-cookies.constants";
import { getCookieFromHeader } from "../auth/utils/auth-cookies.util";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { CHAT_MESSAGE_MAX_LENGTH, isChatRoomIdParam } from "./chat.constants";
import { ChatPresenceService } from "./chat-presence.service";
import { ChatSocketThrottleService } from "./chat-socket-throttle.service";
import { ChatService } from "./chat.service";
import { chatMessageToBroadcastPayload } from "./types/chat-response.type";

type ChatSocket = Socket & {
  data: { userId?: string; joinedPresenceRooms?: Set<string> };
};

type RoomEventPayload = { roomId: string };
type SendMessageEventPayload = { roomId: string; message?: unknown };
type TypingEventPayload = { roomId: string; typing?: boolean };

const CHAT_ERROR_FALLBACK = "Chat event failed";

@WebSocketGateway({
  namespace: "/chat",
  cors: socketIoCors,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly presence: ChatPresenceService,
    private readonly socketThrottle: ChatSocketThrottleService,
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
        this.emitRoomPresence(roomId, this.presence.leave(roomId, userId));
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
    await this.handleEvent(client, async () => {
      const userId = this.requireUserId(client);
      const roomId = this.requireRoomId(client, payload.roomId);
      if (!roomId) {
        return;
      }

      await this.chatService.assertCanAccessRoom(roomId, userId);
      await client.join(roomId);

      client.data.joinedPresenceRooms ??= new Set();
      if (!client.data.joinedPresenceRooms.has(roomId)) {
        client.data.joinedPresenceRooms.add(roomId);
        this.emitRoomPresence(roomId, this.presence.join(roomId, userId));
      }
    });
  }

  @SubscribeMessage("chat:leaveRoom")
  async leaveRoom(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: RoomEventPayload,
  ): Promise<void> {
    await this.handleEvent(client, async () => {
      const roomId = this.requireRoomId(client, payload.roomId);
      if (!roomId) {
        return;
      }

      const userId = this.requireUserId(client);
      await client.leave(roomId);

      if (client.data.joinedPresenceRooms?.has(roomId)) {
        client.data.joinedPresenceRooms.delete(roomId);
        this.emitRoomPresence(roomId, this.presence.leave(roomId, userId));
      }
    });
  }

  @SubscribeMessage("chat:typing")
  async typing(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: TypingEventPayload,
  ): Promise<void> {
    await this.handleEvent(client, async () => {
      const userId = this.requireUserId(client);
      const roomId = this.requireRoomId(client, payload.roomId);
      if (!roomId) {
        return;
      }

      await this.chatService.assertCanAccessRoom(roomId, userId);
      const typing = payload.typing !== false;

      client.to(roomId).emit("chat:typing", {
        roomId,
        userId,
        typing,
      });
    });
  }

  @SubscribeMessage("chat:sendMessage")
  async sendMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: SendMessageEventPayload,
  ): Promise<void> {
    await this.handleEvent(client, async () => {
      const userId = this.requireUserId(client);
      const roomId = this.requireRoomId(client, payload.roomId);
      if (!roomId) {
        return;
      }

      const messageText = this.normalizeWsMessageText(client, payload.message);
      if (messageText === null) {
        return;
      }

      if (!this.socketThrottle.allowMessageSend(userId)) {
        this.emitError(client, "Too many messages, slow down");
        return;
      }

      const created = await this.chatService.sendMessage(roomId, userId, {
        message: messageText,
      });

      this.server
        .to(roomId)
        .emit("chat:newMessage", chatMessageToBroadcastPayload(created));
    });
  }

  private async handleEvent(
    client: ChatSocket,
    fn: () => Promise<void>,
  ): Promise<void> {
    try {
      await fn();
    } catch (error) {
      this.emitError(
        client,
        getErrorMessageFromUnknown(error, CHAT_ERROR_FALLBACK),
      );
    }
  }

  private emitRoomPresence(roomId: string, membersOnlineCount: number): void {
    this.server.to(roomId).emit("chat:roomPresence", {
      roomId,
      membersOnlineCount,
    });
  }

  private requireRoomId(
    client: ChatSocket,
    raw: string | undefined,
  ): string | null {
    const t = raw?.trim() ?? "";
    if (!t) {
      this.emitError(client, "Room id is required");
      return null;
    }
    if (!isChatRoomIdParam(t)) {
      this.emitError(client, "Invalid room id");
      return null;
    }
    return t;
  }

  private normalizeWsMessageText(
    client: ChatSocket,
    raw: unknown,
  ): string | null {
    if (typeof raw !== "string") {
      this.emitError(client, "Message must be a non-empty string");
      return null;
    }
    const text = raw.trim();
    if (text.length === 0) {
      this.emitError(client, "Message cannot be empty");
      return null;
    }
    if (text.length > CHAT_MESSAGE_MAX_LENGTH) {
      this.emitError(
        client,
        `Message cannot exceed ${CHAT_MESSAGE_MAX_LENGTH} characters`,
      );
      return null;
    }
    return text;
  }

  private requireUserId(client: ChatSocket): string {
    const userId = client.data.userId;
    if (!userId) {
      throw new UnauthorizedException("Missing authenticated user");
    }
    return userId;
  }

  private extractAccessToken(client: ChatSocket): string | null {
    const fromCookie = getCookieFromHeader(
      client.handshake.headers.cookie,
      ACCESS_TOKEN_COOKIE,
    );
    if (fromCookie) {
      return fromCookie;
    }
    const authToken = client.handshake.auth?.token;
    return typeof authToken === "string" && authToken.length > 0
      ? authToken
      : null;
  }

  private emitError(client: ChatSocket, message: string): void {
    client.emit("chat:error", { message });
  }
}
