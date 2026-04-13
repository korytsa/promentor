import { ChatRoomType } from "@prisma/client";

export type FakeUser = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  jobTitle?: string | null;
};
export type FakeRoom = {
  id: string;
  name: string | null;
  type: ChatRoomType;
  privatePairKey: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};
export type FakeRoomWithCount = FakeRoom & { _count: { members: number } };
export type FakeMember = { roomId: string; userId: string; lastReadAt?: Date };
export type FakeMessage = {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: Date;
};

export class FakePrismaService {
  users: FakeUser[] = [
    {
      id: "user_1",
      fullName: "User One",
      avatarUrl: null,
      jobTitle: "Senior Engineer",
    },
    {
      id: "user_2",
      fullName: "User Two",
      avatarUrl: null,
      jobTitle: "Designer",
    },
    {
      id: "user_3",
      fullName: "User Three",
      avatarUrl: null,
      jobTitle: null,
    },
  ];
  rooms: FakeRoom[] = [
    {
      id: "5db0da20-b916-4c44-8ad6-b4bea76f0ea5",
      name: null,
      type: ChatRoomType.PRIVATE,
      privatePairKey: "user_1:user_2",
      createdBy: "user_1",
      createdAt: new Date("2026-04-01T10:00:00.000Z"),
      updatedAt: new Date("2026-04-01T10:00:00.000Z"),
    },
  ];
  members: FakeMember[] = [
    { roomId: "5db0da20-b916-4c44-8ad6-b4bea76f0ea5", userId: "user_1" },
    { roomId: "5db0da20-b916-4c44-8ad6-b4bea76f0ea5", userId: "user_2" },
  ];
  messages: FakeMessage[] = [];

  $connect = async () => undefined;
  $disconnect = async () => undefined;
  $transaction = async <R>(
    arg: Promise<R>[] | ((tx: FakePrismaService) => Promise<R>),
  ): Promise<R | R[]> => {
    if (typeof arg === "function") {
      return arg(this);
    }
    return Promise.all(arg);
  };

  user = {
    findMany: async (args: {
      where:
        | { id: { in: string[] } }
        | {
            id: { not: string };
            OR: Array<{
              fullName?: { contains: string; mode: string };
              jobTitle?: { contains: string; mode: string };
            }>;
          };
      select:
        | { id: true }
        | {
            id: true;
            fullName: true;
            avatarUrl: true;
            jobTitle: true;
          };
      orderBy?: { fullName: "asc" };
      take?: number;
    }): Promise<
      | Array<{ id: string }>
      | Array<{
          id: string;
          fullName: string;
          avatarUrl: string | null;
          jobTitle: string | null;
        }>
    > => {
      const where = args.where;
      if ("in" in where.id) {
        const ids = new Set(where.id.in);
        return this.users
          .filter((user) => ids.has(user.id))
          .map((user) => ({ id: user.id }));
      } else {
        const searchWhere = where as {
          id: { not: string };
          OR: Array<{
            fullName?: { contains: string; mode: string };
            jobTitle?: { contains: string; mode: string };
          }>;
        };
        const notId = searchWhere.id.not;
        const or = searchWhere.OR;
        const q =
          or.find((o) => o.fullName)?.fullName?.contains ??
          or.find((o) => o.jobTitle)?.jobTitle?.contains ??
          "";
        const ql = q.toLowerCase();
        let rows = this.users.filter((u) => u.id !== notId);
        rows = rows.filter(
          (u) =>
            u.fullName.toLowerCase().includes(ql) ||
            Boolean(u.jobTitle && u.jobTitle.toLowerCase().includes(ql)),
        );
        rows.sort((a, b) => a.fullName.localeCompare(b.fullName));
        const take = args.take ?? 20;
        return rows.slice(0, take).map((u) => ({
          id: u.id,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          jobTitle: u.jobTitle ?? null,
        }));
      }
    },
  };

  chatRoom = {
    findFirst: async (args: {
      where: {
        id: string;
        members: { some: { userId: string } };
      };
      select?: { id: true };
    }): Promise<{ id: string } | null> => {
      const room = this.rooms.find((entry) => entry.id === args.where.id);
      if (!room) {
        return null;
      }
      const userId = args.where.members.some.userId;
      const isMember = this.members.some(
        (member) => member.roomId === room.id && member.userId === userId,
      );
      if (!isMember) {
        return null;
      }
      return { id: room.id };
    },
    findUnique: async (args: {
      where: { id?: string; privatePairKey?: string };
      select?: { id: true };
      include?: { _count: { select: { members: true } } };
    }): Promise<FakeRoom | FakeRoomWithCount | { id: string } | null> => {
      const room =
        args.where.id !== undefined
          ? this.rooms.find((entry) => entry.id === args.where.id)
          : this.rooms.find(
              (entry) => entry.privatePairKey === args.where.privatePairKey,
            );
      if (!room) {
        return null;
      }
      if (args.select?.id) {
        return { id: room.id };
      }
      if (args.include?._count) {
        return {
          ...room,
          _count: {
            members: this.members.filter((member) => member.roomId === room.id)
              .length,
          },
        };
      }
      return room;
    },
    update: async (args: {
      where: { id: string };
      data: { updatedAt: Date };
      select: { id: true };
    }): Promise<{ id: string }> => {
      const room = this.rooms.find((entry) => entry.id === args.where.id);
      if (!room) {
        throw new Error("Room not found");
      }
      room.updatedAt = args.data.updatedAt;
      return { id: room.id };
    },
    create: async (args: {
      data: {
        name: string | null;
        type: ChatRoomType;
        privatePairKey: string | null;
        createdBy: string;
        members: {
          createMany: {
            data: Array<{ userId: string; lastReadAt?: Date }>;
          };
        };
      };
      include: { _count: { select: { members: true } } };
    }): Promise<FakeRoomWithCount> => {
      const now = new Date();
      const room: FakeRoom = {
        id: crypto.randomUUID(),
        name: args.data.name,
        type: args.data.type,
        privatePairKey: args.data.privatePairKey,
        createdBy: args.data.createdBy,
        createdAt: now,
        updatedAt: now,
      };
      this.rooms.push(room);
      args.data.members.createMany.data.forEach((member) => {
        this.members.push({
          roomId: room.id,
          userId: member.userId,
          ...(member.lastReadAt !== undefined
            ? { lastReadAt: member.lastReadAt }
            : {}),
        });
      });
      return {
        ...room,
        _count: {
          members: this.members.filter((member) => member.roomId === room.id)
            .length,
        },
      };
    },
  };

  roomMember = {
    findUnique: async (args: {
      where: { roomId_userId: { roomId: string; userId: string } };
      select: { roomId: true };
    }): Promise<{ roomId: string } | null> => {
      const found = this.members.find(
        (member) =>
          member.roomId === args.where.roomId_userId.roomId &&
          member.userId === args.where.roomId_userId.userId,
      );
      return found ? { roomId: found.roomId } : null;
    },
    update: async (args: {
      where: { roomId_userId: { roomId: string; userId: string } };
      data: { lastReadAt: Date };
    }): Promise<{ roomId: string; userId: string }> => {
      const member = this.members.find(
        (m) =>
          m.roomId === args.where.roomId_userId.roomId &&
          m.userId === args.where.roomId_userId.userId,
      );
      if (member) {
        member.lastReadAt = args.data.lastReadAt;
      }
      return {
        roomId: args.where.roomId_userId.roomId,
        userId: args.where.roomId_userId.userId,
      };
    },
  };

  chatMessage = {
    create: async (args: {
      data: { roomId: string; senderId: string; message: string };
      select: {
        id: true;
        roomId: true;
        senderId: true;
        message: true;
        createdAt: true;
        sender?: { select: { id: true; fullName: true; avatarUrl: true } };
      };
    }): Promise<
      | FakeMessage
      | (FakeMessage & {
          sender: { id: string; fullName: string; avatarUrl: string | null };
        })
    > => {
      const created: FakeMessage = {
        id: crypto.randomUUID(),
        roomId: args.data.roomId,
        senderId: args.data.senderId,
        message: args.data.message,
        createdAt: new Date(),
      };
      this.messages.push(created);
      if (args.select.sender) {
        const senderUser = this.users.find((u) => u.id === args.data.senderId);
        return {
          ...created,
          sender: {
            id: senderUser?.id ?? args.data.senderId,
            fullName: senderUser?.fullName ?? "Unknown",
            avatarUrl: senderUser?.avatarUrl ?? null,
          },
        };
      }
      return created;
    },
  };
}
