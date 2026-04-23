import {
  ChatRoomType,
  MentorBroadcastScope,
  MentorBroadcastStatus,
  UserRole,
} from "@prisma/client";

export type FakeUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  jobTitle?: string | null;
  about?: string | null;
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
export type FakeUserBoard = {
  id: string;
  name: string;
  ownerId: string;
  mentorId: string;
};
export type FakeMentorBroadcastRequest = {
  id: string;
  mentorId: string;
  scope: MentorBroadcastScope;
  teamId: string | null;
  menteeId: string | null;
  boardId: string | null;
  targetLabel: string;
  contextLine: string | null;
  body: string;
  status: MentorBroadcastStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class FakePrismaService {
  userUpdateError: Error | null = null;
  userDeleteError: Error | null = null;
  users: FakeUser[] = [
    {
      id: "user_1",
      fullName: "User One",
      email: "u1@test.dev",
      role: UserRole.MENTOR,
      avatarUrl: null,
      jobTitle: "Senior Engineer",
      about: null,
    },
    {
      id: "user_2",
      fullName: "User Two",
      email: "u2@test.dev",
      role: UserRole.REGULAR_USER,
      avatarUrl: null,
      jobTitle: "Designer",
      about: null,
    },
    {
      id: "user_3",
      fullName: "User Three",
      email: "u3@test.dev",
      role: UserRole.REGULAR_USER,
      avatarUrl: null,
      jobTitle: null,
      about: null,
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
  userBoards: FakeUserBoard[] = [
    {
      id: "board_ok_e2e",
      name: "Mentor One Board",
      ownerId: "user_2",
      mentorId: "user_1",
    },
    {
      id: "board_foreign_e2e",
      name: "Other mentor board",
      ownerId: "user_2",
      mentorId: "user_3",
    },
  ];
  mentorBroadcastRequests: FakeMentorBroadcastRequest[] = [];

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
    count: async (args?: {
      where?: { role?: UserRole } | Record<string, never>;
    }): Promise<number> => {
      const w = args?.where;
      const isEmptyWhere =
        w === undefined ||
        w === null ||
        (typeof w === "object" && Object.keys(w).length === 0);
      if (isEmptyWhere) {
        return this.users.length;
      }
      if (w && "role" in w && w.role !== undefined) {
        return this.users.filter((u) => u.role === w.role).length;
      }
      return this.users.length;
    },
    findMany: async (args: {
      where?:
        | { role: UserRole }
        | Record<string, never>
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
            email: true;
            role: true;
            avatarUrl: true;
            jobTitle: true;
            about: true;
          }
        | {
            id: true;
            fullName: true;
            avatarUrl: true;
            jobTitle: true;
          };
      orderBy?:
        | Array<{ fullName: "asc" } | { createdAt: "asc" }>
        | { fullName: "asc" };
      skip?: number;
      take?: number;
    }): Promise<
      | Array<{ id: string }>
      | Array<{
          id: string;
          fullName: string;
          email: string;
          role: UserRole;
          avatarUrl: string | null;
          jobTitle: string | null;
          about: string | null;
        }>
      | Array<{
          id: string;
          fullName: string;
          avatarUrl: string | null;
          jobTitle: string | null;
        }>
    > => {
      const where = args.where;
      const isEmptyWhere =
        where === undefined ||
        where === null ||
        (typeof where === "object" && Object.keys(where).length === 0);

      const mapFullUser = (user: FakeUser) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        jobTitle: user.jobTitle ?? null,
        about: user.about ?? null,
      });

      const sliceSortedList = (rows: FakeUser[]) => {
        const sorted = [...rows].sort((a, b) =>
          a.fullName.localeCompare(b.fullName),
        );
        const skip = args.skip ?? 0;
        const take = args.take ?? sorted.length;
        return sorted.slice(skip, skip + take).map(mapFullUser);
      };

      if (isEmptyWhere) {
        return sliceSortedList(this.users);
      }

      if (
        typeof where === "object" &&
        "role" in where &&
        (where as { role?: UserRole }).role !== undefined &&
        !("id" in where)
      ) {
        const role = (where as { role: UserRole }).role;
        return sliceSortedList(this.users.filter((u) => u.role === role));
      }

      if (
        typeof where === "object" &&
        "id" in where &&
        where.id &&
        typeof where.id === "object" &&
        "in" in where.id
      ) {
        const ids = new Set(where.id.in);
        return this.users
          .filter((user) => ids.has(user.id))
          .map((user) => ({ id: user.id }));
      }

      if (
        typeof where === "object" &&
        "id" in where &&
        where.id &&
        typeof where.id === "object" &&
        "not" in where.id &&
        "OR" in where &&
        Array.isArray((where as { OR: unknown }).OR)
      ) {
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

      return sliceSortedList(this.users);
    },
    update: async (args: {
      where: { id: string };
      data: {
        fullName?: string;
        avatarUrl?: string | null;
        jobTitle?: string | null;
        about?: string | null;
      };
      select: {
        id: true;
        fullName: true;
        email: true;
        role: true;
        avatarUrl: true;
        jobTitle: true;
        about: true;
      };
    }): Promise<{
      id: string;
      fullName: string;
      email: string;
      role: UserRole;
      avatarUrl: string | null;
      jobTitle: string | null;
      about: string | null;
    }> => {
      if (this.userUpdateError) {
        throw this.userUpdateError;
      }

      const user = this.users.find((entry) => entry.id === args.where.id);
      if (!user) {
        const error = new Error("User not found") as Error & { code: string };
        error.code = "P2025";
        throw error;
      }

      Object.assign(user, args.data);

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        jobTitle: user.jobTitle ?? null,
        about: user.about ?? null,
      };
    },
    delete: async (args: {
      where: { id: string };
    }): Promise<{ id: string }> => {
      if (this.userDeleteError) {
        throw this.userDeleteError;
      }

      const index = this.users.findIndex((entry) => entry.id === args.where.id);
      if (index === -1) {
        const error = new Error("User not found") as Error & { code: string };
        error.code = "P2025";
        throw error;
      }

      const [deleted] = this.users.splice(index, 1);
      return { id: deleted!.id };
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
      select: { id: true } | { updatedAt: true };
    }): Promise<{ id: string } | { updatedAt: Date }> => {
      const room = this.rooms.find((entry) => entry.id === args.where.id);
      if (!room) {
        throw new Error("Room not found");
      }
      room.updatedAt = args.data.updatedAt;
      if ("updatedAt" in args.select && args.select.updatedAt) {
        return { updatedAt: room.updatedAt };
      }
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
    findMany: async (args: {
      where: { roomId: string };
      select: { userId: true };
    }): Promise<{ userId: string }[]> => {
      return this.members
        .filter((m) => m.roomId === args.where.roomId)
        .map((m) => ({ userId: m.userId }));
    },
    findUnique: async (args: {
      where: { roomId_userId: { roomId: string; userId: string } };
      select: { roomId?: true; lastReadAt?: true };
    }): Promise<
      | { roomId: string }
      | { lastReadAt: Date | undefined }
      | { roomId: string; lastReadAt: Date | undefined }
      | null
    > => {
      const found = this.members.find(
        (member) =>
          member.roomId === args.where.roomId_userId.roomId &&
          member.userId === args.where.roomId_userId.userId,
      );
      if (!found) {
        return null;
      }
      const sel = args.select;
      if (sel.roomId && sel.lastReadAt) {
        return { roomId: found.roomId, lastReadAt: found.lastReadAt };
      }
      if (sel.lastReadAt) {
        return { lastReadAt: found.lastReadAt };
      }
      return { roomId: found.roomId };
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
    findFirst: async (args: {
      where: { id: string; roomId: string } | { roomId: string };
      orderBy?: { createdAt: "asc" | "desc" };
      select: { createdAt: true };
    }): Promise<{ createdAt: Date } | null> => {
      const where = args.where;
      let list = this.messages.filter((m) => m.roomId === where.roomId);
      if ("id" in where && where.id !== undefined) {
        const row = list.find((m) => m.id === where.id);
        return row ? { createdAt: row.createdAt } : null;
      }
      if (list.length === 0) {
        return null;
      }
      list = [...list].sort((a, b) => {
        const d = a.createdAt.getTime() - b.createdAt.getTime();
        return args.orderBy?.createdAt === "desc" ? -d : d;
      });
      return { createdAt: list[0]!.createdAt };
    },
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

  userBoard = {
    findFirst: async (args: {
      where: { id: string; mentorId: string };
      select: { id: true; name: true };
    }): Promise<{ id: string; name: string } | null> => {
      const board = this.userBoards.find(
        (b) => b.id === args.where.id && b.mentorId === args.where.mentorId,
      );
      return board ? { id: board.id, name: board.name } : null;
    },
    findMany: async (args: {
      where: { mentorId: string };
      select: { id: true; name: true };
      orderBy?: { name: "asc" };
    }): Promise<Array<{ id: string; name: string }>> => {
      const rows = this.userBoards
        .filter((b) => b.mentorId === args.where.mentorId)
        .sort((a, b) => a.name.localeCompare(b.name));
      return rows.map((b) => ({ id: b.id, name: b.name }));
    },
  };

  mentorBroadcastRequest = {
    create: async (args: {
      data: {
        mentor: { connect: { id: string } };
        scope: MentorBroadcastScope;
        team?: { connect: { id: string } };
        mentee?: { connect: { id: string } };
        userBoard?: { connect: { id: string } };
        targetLabel: string;
        contextLine: string | null;
        body: string;
      };
      select: {
        id: true;
        scope: true;
        teamId: true;
        menteeId: true;
        boardId: true;
        targetLabel: true;
        contextLine: true;
        body: true;
        status: true;
        createdAt: true;
        updatedAt: true;
      };
    }): Promise<{
      id: string;
      scope: MentorBroadcastScope;
      teamId: string | null;
      menteeId: string | null;
      boardId: string | null;
      targetLabel: string;
      contextLine: string | null;
      body: string;
      status: MentorBroadcastStatus;
      createdAt: Date;
      updatedAt: Date;
    }> => {
      const mentorId = args.data.mentor.connect.id;
      const now = new Date();
      const row: FakeMentorBroadcastRequest = {
        id: `mbr_${crypto.randomUUID()}`,
        mentorId,
        scope: args.data.scope,
        teamId: args.data.team?.connect.id ?? null,
        menteeId: args.data.mentee?.connect.id ?? null,
        boardId: args.data.userBoard?.connect.id ?? null,
        targetLabel: args.data.targetLabel,
        contextLine: args.data.contextLine,
        body: args.data.body,
        status: MentorBroadcastStatus.DELIVERED,
        createdAt: now,
        updatedAt: now,
      };
      this.mentorBroadcastRequests.push(row);
      return {
        id: row.id,
        scope: row.scope,
        teamId: row.teamId,
        menteeId: row.menteeId,
        boardId: row.boardId,
        targetLabel: row.targetLabel,
        contextLine: row.contextLine,
        body: row.body,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    },
  };
}
