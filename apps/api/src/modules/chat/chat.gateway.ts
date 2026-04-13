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
import { ChatService } from "./chat.service";
import { chatMessageToBroadcastPayload } from "./types/chat-response.type";
import { ACCESS_TOKEN_COOKIE } from "../auth/constants/auth-cookies.constants";
import { JwtPayload } from "../auth/types/jwt-payload.type";

type ChatSocket = Socket & { data: { userId?: string } };

type RoomEventPayload = {
  roomId: string;
};

type SendMessageEventPayload = {
  roomId: string;
  message: string;
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
      const roomId = payload.roomId?.trim();
      if (!roomId) {
        this.emitError(client, "Room id is required");
        return;
      }

      await this.chatService.assertCanAccessRoom(roomId, userId);
      await client.join(roomId);
    } catch (error) {
      this.emitError(client, this.getErrorMessage(error));
    }
  }

  @SubscribeMessage("chat:leaveRoom")
  async leaveRoom(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: RoomEventPayload,
  ): Promise<void> {
    const roomId = payload.roomId?.trim();
    if (!roomId) {
      this.emitError(client, "Room id is required");
      return;
    }
    await client.leave(roomId);
  }

  @SubscribeMessage("chat:sendMessage")
  async sendMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: SendMessageEventPayload,
  ): Promise<void> {
    try {
      const userId = this.requireUserId(client);
      const roomId = payload.roomId?.trim();
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
