import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ChatRealtimePublisher } from "./chat-realtime.publisher";
import { ChatRoomService } from "./chat-room.service";
import {
  DEFAULT_MESSAGES_LIMIT,
  DEFAULT_MESSAGES_OFFSET,
  USER_PUBLIC_SELECT,
} from "./chat.constants";
import { MarkRoomReadDto } from "./dto/mark-room-read.dto";
import { ListRoomMessagesQueryDto } from "./dto/list-room-messages.query";
import { SendMessagePayload } from "./dto/send-message.dto";
import {
  ChatMessageResponse,
  ChatMessagesPageResponse,
} from "./types/chat-response.type";
import { parseClientMessageIdForSend } from "./utils/client-message-id.util";

@Injectable()
export class ChatMessagesService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly rooms: ChatRoomService,
    private readonly chatRealtime: ChatRealtimePublisher,
  ) {}

  async listMessages(
    roomId: string,
    userId: string,
    query: ListRoomMessagesQueryDto,
  ): Promise<ChatMessagesPageResponse> {
    await this.rooms.assertCanAccessRoom(roomId, userId);

    const limit = query.limit ?? DEFAULT_MESSAGES_LIMIT;
    const offset = query.offset ?? DEFAULT_MESSAGES_OFFSET;

    const [total, rawMessages] = await this.prisma.$transaction([
      this.prisma.chatMessage.count({ where: { roomId } }),
      this.prisma.chatMessage.findMany({
        where: { roomId },
        orderBy: { createdAt: "asc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          roomId: true,
          senderId: true,
          message: true,
          createdAt: true,
          sender: {
            select: USER_PUBLIC_SELECT,
          },
        },
      }),
    ]);

    return {
      items: rawMessages.map((m) => this.mapMessageToResponse(m, userId)),
      total,
      limit,
      offset,
    };
  }

  async sendMessage(
    roomId: string,
    userId: string,
    dto: SendMessagePayload,
  ): Promise<ChatMessageResponse> {
    await this.rooms.assertCanAccessRoom(roomId, userId);
    const message = dto.message.trim();
    if (message.length === 0) {
      throw new BadRequestException("Message cannot be empty");
    }

    const correlationId = parseClientMessageIdForSend(dto.clientMessageId);

    const created = await this.prisma.$transaction(async (tx) => {
      const messageRow = await tx.chatMessage.create({
        data: {
          roomId,
          senderId: userId,
          message,
        },
        select: {
          id: true,
          roomId: true,
          senderId: true,
          message: true,
          createdAt: true,
          sender: {
            select: USER_PUBLIC_SELECT,
          },
        },
      });
      const room = await tx.chatRoom.update({
        where: { id: roomId },
        data: {
          updatedAt: new Date(),
        },
        select: { updatedAt: true },
      });
      await tx.roomMember.update({
        where: {
          roomId_userId: { roomId, userId },
        },
        data: { lastReadAt: messageRow.createdAt },
      });
      const memberRows = await tx.roomMember.findMany({
        where: { roomId },
        select: { userId: true },
      });
      return {
        messageRow,
        roomUpdatedAt: room.updatedAt,
        memberIds: memberRows.map((r) => r.userId),
      };
    });

    this.chatRealtime.notifyRoomsChanged(
      created.memberIds,
      "new_message",
      roomId,
      created.roomUpdatedAt,
    );

    const base = this.mapMessageToResponse(created.messageRow, userId);
    if (correlationId === undefined) {
      return base;
    }
    return { ...base, clientMessageId: correlationId };
  }

  async markRoomRead(
    roomId: string,
    userId: string,
    dto: MarkRoomReadDto,
  ): Promise<void> {
    await this.rooms.assertCanAccessRoom(roomId, userId);

    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
      select: { lastReadAt: true },
    });
    if (!member) {
      throw new NotFoundException("Room membership not found");
    }

    let requestedReadAt: Date;
    if (dto.messageId) {
      const msg = await this.prisma.chatMessage.findFirst({
        where: { id: dto.messageId, roomId },
        select: { createdAt: true },
      });
      if (!msg) {
        throw new NotFoundException("Message not found");
      }
      requestedReadAt = msg.createdAt;
    } else {
      const latest = await this.prisma.chatMessage.findFirst({
        where: { roomId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      requestedReadAt = latest?.createdAt ?? new Date();
    }

    const nextReadAt = new Date(
      Math.max(requestedReadAt.getTime(), member.lastReadAt?.getTime() ?? 0),
    );

    await this.prisma.roomMember.update({
      where: {
        roomId_userId: { roomId, userId },
      },
      data: { lastReadAt: nextReadAt },
    });
  }

  private mapMessageToResponse(
    row: {
      id: string;
      roomId: string;
      senderId: string;
      message: string;
      createdAt: Date;
      sender: { id: string; fullName: string; avatarUrl: string | null };
    },
    viewerUserId: string,
  ): ChatMessageResponse {
    return {
      id: row.id,
      roomId: row.roomId,
      senderId: row.senderId,
      message: row.message,
      createdAt: row.createdAt,
      sender: row.sender,
      isOwn: row.senderId === viewerUserId,
    };
  }
}
