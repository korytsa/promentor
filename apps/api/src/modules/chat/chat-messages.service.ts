import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ChatRoomService } from "./chat-room.service";
import {
  DEFAULT_MESSAGES_LIMIT,
  DEFAULT_MESSAGES_OFFSET,
  USER_PUBLIC_SELECT,
} from "./chat.constants";
import { MarkRoomReadDto } from "./dto/mark-room-read.dto";
import { ListRoomMessagesQueryDto } from "./dto/list-room-messages.query";
import { SendMessageDto } from "./dto/send-message.dto";
import {
  ChatMessageResponse,
  ChatMessagesPageResponse,
} from "./types/chat-response.type";

@Injectable()
export class ChatMessagesService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly rooms: ChatRoomService,
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
    dto: SendMessageDto,
  ): Promise<ChatMessageResponse> {
    await this.rooms.assertCanAccessRoom(roomId, userId);
    const message = dto.message.trim();
    if (message.length === 0) {
      throw new BadRequestException("Message cannot be empty");
    }

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
      await tx.chatRoom.update({
        where: { id: roomId },
        data: {
          updatedAt: new Date(),
        },
        select: { id: true },
      });
      await tx.roomMember.update({
        where: {
          roomId_userId: { roomId, userId },
        },
        data: { lastReadAt: messageRow.createdAt },
      });
      return messageRow;
    });

    return this.mapMessageToResponse(created, userId);
  }

  async markRoomRead(
    roomId: string,
    userId: string,
    dto: MarkRoomReadDto,
  ): Promise<void> {
    await this.rooms.assertCanAccessRoom(roomId, userId);

    let readAt: Date;
    if (dto.messageId) {
      const msg = await this.prisma.chatMessage.findFirst({
        where: { id: dto.messageId, roomId },
        select: { createdAt: true },
      });
      if (!msg) {
        throw new NotFoundException("Message not found");
      }
      readAt = msg.createdAt;
    } else {
      const latest = await this.prisma.chatMessage.findFirst({
        where: { roomId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      readAt = latest?.createdAt ?? new Date();
    }

    await this.prisma.roomMember.update({
      where: {
        roomId_userId: { roomId, userId },
      },
      data: { lastReadAt: readAt },
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
