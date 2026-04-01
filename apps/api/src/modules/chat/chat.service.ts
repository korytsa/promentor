import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ChatRoomType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { ListRoomMessagesQueryDto } from "./dto/list-room-messages.query";
import { SendMessageDto } from "./dto/send-message.dto";
import {
  ChatMessageResponse,
  ChatMessagesPageResponse,
  ChatRoomListItemResponse,
  ChatRoomResponse,
} from "./types/chat-response.type";

const DEFAULT_MESSAGES_LIMIT = 30;
const DEFAULT_MESSAGES_OFFSET = 0;

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async listRooms(userId: string): Promise<ChatRoomListItemResponse[]> {
    const memberships = await this.prisma.roomMember.findMany({
      where: { userId },
      orderBy: { room: { updatedAt: "desc" } },
      include: {
        room: {
          include: {
            messages: {
              select: {
                id: true,
                message: true,
                senderId: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    return memberships.map((membership) => ({
      id: membership.room.id,
      name: membership.room.name,
      type: this.toApiRoomType(membership.room.type),
      updatedAt: membership.room.updatedAt,
      membersCount: membership.room._count.members,
      lastMessage: membership.room.messages[0] ?? null,
    }));
  }

  async listMessages(
    roomId: string,
    userId: string,
    query: ListRoomMessagesQueryDto,
  ): Promise<ChatMessagesPageResponse> {
    await this.assertCanAccessRoom(roomId, userId);

    const limit = query.limit ?? DEFAULT_MESSAGES_LIMIT;
    const offset = query.offset ?? DEFAULT_MESSAGES_OFFSET;

    const [total, messages] = await this.prisma.$transaction([
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
        },
      }),
    ]);

    return {
      items: messages,
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
    await this.assertCanAccessRoom(roomId, userId);
    const message = dto.message.trim();
    if (message.length === 0) {
      throw new BadRequestException("Message cannot be empty");
    }

    const [created] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
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
        },
      }),
      this.prisma.chatRoom.update({
        where: { id: roomId },
        data: {
          updatedAt: new Date(),
        },
        select: { id: true },
      }),
    ]);

    return created;
  }

  async createRoom(
    userId: string,
    dto: CreateRoomDto,
  ): Promise<ChatRoomResponse> {
    const roomType =
      dto.type === "private" ? ChatRoomType.PRIVATE : ChatRoomType.GROUP;
    const memberIds = Array.from(
      new Set(dto.memberIds.map((id) => id.trim()).filter(Boolean)),
    ).filter((id) => id !== userId);

    if (roomType === ChatRoomType.PRIVATE && memberIds.length !== 1) {
      throw new BadRequestException(
        "Private room must include exactly one additional member",
      );
    }

    if (roomType === ChatRoomType.GROUP && memberIds.length < 1) {
      throw new BadRequestException(
        "Group room must include at least one additional member",
      );
    }

    const participants = [userId, ...memberIds];
    if (participants.length < 2) {
      throw new BadRequestException(
        "Room must include at least two participants",
      );
    }

    const privatePairKey =
      roomType === ChatRoomType.PRIVATE
        ? this.getPrivatePairKey(userId, participants[1])
        : null;

    const users = await this.prisma.user.findMany({
      where: { id: { in: participants } },
      select: { id: true },
    });
    if (users.length !== participants.length) {
      throw new BadRequestException("One or more participants do not exist");
    }

    if (roomType === ChatRoomType.PRIVATE) {
      const existingPrivate = await this.findPrivateRoomByPairKey(
        privatePairKey!,
      );
      if (existingPrivate) {
        return existingPrivate;
      }
    }

    if (roomType === ChatRoomType.GROUP && !dto.name?.trim()) {
      throw new BadRequestException("Group room name is required");
    }

    try {
      const createdRoom = await this.prisma.chatRoom.create({
        data: {
          name:
            roomType === ChatRoomType.GROUP ? dto.name?.trim() || null : null,
          type: roomType,
          privatePairKey,
          createdBy: userId,
          members: {
            createMany: {
              data: participants.map((participantId) => ({
                userId: participantId,
              })),
            },
          },
        },
        include: {
          _count: {
            select: { members: true },
          },
        },
      });

      return {
        id: createdRoom.id,
        name: createdRoom.name,
        type: this.toApiRoomType(createdRoom.type),
        createdBy: createdRoom.createdBy,
        createdAt: createdRoom.createdAt,
        updatedAt: createdRoom.updatedAt,
        membersCount: createdRoom._count.members,
      };
    } catch (error) {
      if (
        roomType === ChatRoomType.PRIVATE &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existingPrivate = await this.findPrivateRoomByPairKey(
          privatePairKey!,
        );
        if (existingPrivate) {
          return existingPrivate;
        }
      }
      throw error;
    }
  }

  async assertCanAccessRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: { id: true },
    });
    if (!room) {
      throw new NotFoundException("Room not found");
    }

    const member = await this.prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      select: { roomId: true },
    });

    if (!member) {
      throw new ForbiddenException("You do not have access to this room");
    }
  }

  private async findPrivateRoomByPairKey(
    privatePairKey: string,
  ): Promise<ChatRoomResponse | null> {
    const room = await this.prisma.chatRoom.findUnique({
      where: {
        privatePairKey,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!room || room._count.members !== 2) {
      return null;
    }

    return {
      id: room.id,
      name: room.name,
      type: this.toApiRoomType(room.type),
      createdBy: room.createdBy,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      membersCount: room._count.members,
    };
  }

  private getPrivatePairKey(firstUserId: string, secondUserId: string): string {
    return [firstUserId, secondUserId].sort().join(":");
  }

  private toApiRoomType(type: ChatRoomType): "private" | "group" {
    return type === ChatRoomType.PRIVATE ? "private" : "group";
  }
}
