import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ChatRoomType, Prisma, PrismaClient } from "@prisma/client";
import { CreateRoomDto } from "./dto/create-room.dto";
import { MarkRoomReadDto } from "./dto/mark-room-read.dto";
import { ListRoomMessagesQueryDto } from "./dto/list-room-messages.query";
import { SendMessageDto } from "./dto/send-message.dto";
import {
  ChatLastMessageResponse,
  ChatMessageResponse,
  ChatMessagesPageResponse,
  ChatRoomDetailResponse,
  ChatRoomListItemResponse,
  ChatRoomResponse,
} from "./types/chat-response.type";

type MemberForPresentation = {
  userId: string;
  user: { fullName: string; avatarUrl: string | null };
};

const DEFAULT_MESSAGES_LIMIT = 30;
const DEFAULT_MESSAGES_OFFSET = 0;

const MESSAGE_SENDER_SELECT = {
  id: true,
  fullName: true,
  avatarUrl: true,
} as const;

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaClient) {}

  async listRooms(userId: string): Promise<ChatRoomListItemResponse[]> {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: "desc" },
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
        members: {
          orderBy: { joinedAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    const unreadByRoom = await this.countUnreadForRooms(
      rooms.map((r) => r.id),
      userId,
    );

    return rooms.map((room) => {
      const members = room.members;
      const apiType = this.toApiRoomType(room.type);

      const { displayTitle, avatarUrls } =
        this.computeDisplayTitleAndAvatarUrls(
          room.type,
          room.name,
          members,
          userId,
        );

      const last = room.messages[0];
      let lastMessage: ChatLastMessageResponse | null = null;
      if (last) {
        const senderMember = members.find((m) => m.userId === last.senderId);
        lastMessage = {
          id: last.id,
          message: last.message,
          senderId: last.senderId,
          senderFullName: senderMember?.user.fullName ?? "Unknown",
          isOwn: last.senderId === userId,
          createdAt: last.createdAt,
        };
      }

      return {
        id: room.id,
        name: room.name,
        displayTitle,
        type: apiType,
        updatedAt: room.updatedAt,
        membersCount: room._count.members,
        avatarUrls,
        lastMessage,
        unreadCount: unreadByRoom.get(room.id) ?? 0,
      };
    });
  }

  async getRoomById(
    roomId: string,
    userId: string,
  ): Promise<ChatRoomDetailResponse> {
    const room = await this.prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        members: {
          some: { userId },
        },
      },
      include: {
        _count: {
          select: { members: true },
        },
        members: {
          orderBy: { joinedAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      const exists = await this.prisma.chatRoom.findUnique({
        where: { id: roomId },
        select: { id: true },
      });
      if (!exists) {
        throw new NotFoundException("Room not found");
      }
      throw new ForbiddenException("You do not have access to this room");
    }

    const { displayTitle, avatarUrls } = this.computeDisplayTitleAndAvatarUrls(
      room.type,
      room.name,
      room.members,
      userId,
    );

    const unreadCount = await this.countUnreadForRoom(room.id, userId);

    return {
      id: room.id,
      name: room.name,
      displayTitle,
      type: this.toApiRoomType(room.type),
      createdBy: room.createdBy,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      membersCount: room._count.members,
      avatarUrls,
      members: room.members.map((m) => ({
        userId: m.userId,
        fullName: m.user.fullName,
        avatarUrl: m.user.avatarUrl,
      })),
      membersOnlineCount: 0,
      unreadCount,
    };
  }

  async markRoomRead(
    roomId: string,
    userId: string,
    dto: MarkRoomReadDto,
  ): Promise<void> {
    await this.assertCanAccessRoom(roomId, userId);

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

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        members: {
          some: { userId },
        },
      },
      select: { id: true, type: true },
    });

    if (!room) {
      const exists = await this.prisma.chatRoom.findUnique({
        where: { id: roomId },
        select: { id: true },
      });
      if (!exists) {
        throw new NotFoundException("Room not found");
      }
      throw new ForbiddenException("You are not a member of this room");
    }

    if (room.type === ChatRoomType.PRIVATE) {
      await this.prisma.chatRoom.delete({ where: { id: roomId } });
      return;
    }

    await this.prisma.roomMember.delete({
      where: {
        roomId_userId: { roomId, userId },
      },
    });
  }

  async listMessages(
    roomId: string,
    userId: string,
    query: ListRoomMessagesQueryDto,
  ): Promise<ChatMessagesPageResponse> {
    await this.assertCanAccessRoom(roomId, userId);

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
            select: MESSAGE_SENDER_SELECT,
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
    await this.assertCanAccessRoom(roomId, userId);
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
            select: MESSAGE_SENDER_SELECT,
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
      const memberReadAt = new Date();
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
                lastReadAt: memberReadAt,
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
    const roomWithMembership = await this.prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        members: {
          some: { userId },
        },
      },
      select: { id: true },
    });
    if (roomWithMembership) {
      return;
    }

    const roomExists = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: { id: true },
    });
    if (!roomExists) {
      throw new NotFoundException("Room not found");
    }

    throw new ForbiddenException("You do not have access to this room");
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

  private async countUnreadForRoom(
    roomId: string,
    viewerUserId: string,
  ): Promise<number> {
    const counts = await this.countUnreadForRooms([roomId], viewerUserId);
    return counts.get(roomId) ?? 0;
  }

  private async countUnreadForRooms(
    roomIds: string[],
    viewerUserId: string,
  ): Promise<Map<string, number>> {
    if (roomIds.length === 0) {
      return new Map();
    }
    const rows = await this.prisma.$queryRaw<
      { room_id: string; c: number }[]
    >(Prisma.sql`
      SELECT m.room_id::text AS room_id, COUNT(*)::int AS c
      FROM chat_messages m
      INNER JOIN room_members rm
        ON rm.room_id = m.room_id AND rm.user_id = ${viewerUserId}
      WHERE m.room_id IN (${Prisma.join(roomIds)})
        AND m.sender_id <> ${viewerUserId}
        AND m.created_at > COALESCE(rm.last_read_at, rm.joined_at)
      GROUP BY m.room_id
    `);
    return new Map(rows.map((r) => [r.room_id, r.c]));
  }

  private computeDisplayTitleAndAvatarUrls(
    roomType: ChatRoomType,
    name: string | null,
    members: MemberForPresentation[],
    viewerUserId: string,
  ): { displayTitle: string; avatarUrls: string[] } {
    const otherMember =
      roomType === ChatRoomType.PRIVATE
        ? members.find((m) => m.userId !== viewerUserId)
        : undefined;

    const displayTitle =
      roomType === ChatRoomType.PRIVATE
        ? (otherMember?.user.fullName ?? name ?? "Chat")
        : name?.trim() || "Group chat";

    const avatarUrls =
      roomType === ChatRoomType.PRIVATE
        ? otherMember?.user.avatarUrl
          ? [otherMember.user.avatarUrl]
          : []
        : members
            .map((m) => m.user.avatarUrl)
            .filter((url): url is string => Boolean(url?.length))
            .slice(0, 3);

    return { displayTitle, avatarUrls };
  }

  private toApiRoomType(type: ChatRoomType): "private" | "group" {
    return type === ChatRoomType.PRIVATE ? "private" : "group";
  }
}
