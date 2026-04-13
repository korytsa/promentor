import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { ChatRoomType, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import { io, type Socket } from "socket.io-client";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/modules/prisma/prisma.service";

type User = { id: string; fullName: string; avatarUrl: string | null };
type Room = {
  id: string;
  name: string | null;
  type: ChatRoomType;
  privatePairKey: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};
type RoomWithCount = Room & { _count: { members: number } };
type Member = { roomId: string; userId: string; lastReadAt?: Date };
type Message = {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: Date;
};

function waitForEvent<T>(
  socket: Socket,
  event: string,
  timeoutMs = 3000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for event "${event}"`));
    }, timeoutMs);

    socket.once(event, (payload: T) => {
      clearTimeout(timeout);
      resolve(payload);
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class FakePrismaService {
  users: User[] = [
    { id: "user_1", fullName: "User One", avatarUrl: null },
    { id: "user_2", fullName: "User Two", avatarUrl: null },
    { id: "user_3", fullName: "User Three", avatarUrl: null },
  ];
  rooms: Room[] = [
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
  members: Member[] = [
    { roomId: "5db0da20-b916-4c44-8ad6-b4bea76f0ea5", userId: "user_1" },
    { roomId: "5db0da20-b916-4c44-8ad6-b4bea76f0ea5", userId: "user_2" },
  ];
  messages: Message[] = [];

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
      where: { id: { in: string[] } };
      select: { id: true };
    }): Promise<Array<{ id: string }>> => {
      const ids = new Set(args.where.id.in);
      return this.users
        .filter((user) => ids.has(user.id))
        .map((user) => ({ id: user.id }));
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
    }): Promise<Room | RoomWithCount | { id: string } | null> => {
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
    }): Promise<RoomWithCount> => {
      const now = new Date();
      const room: Room = {
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
      | Message
      | (Message & {
          sender: { id: string; fullName: string; avatarUrl: string | null };
        })
    > => {
      const created: Message = {
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

describe("Chat backend (e2e)", () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let accessTokenUser3: string;
  let fakePrisma: FakePrismaService;
  let baseUrl: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "development";
    fakePrisma = new FakePrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.listen(0);
    baseUrl = await app.getUrl();
    jwtService = app.get(JwtService);
    accessTokenUser1 = await jwtService.signAsync({
      sub: "user_1",
      email: "u1@test.dev",
      role: UserRole.MENTOR,
    });
    accessTokenUser2 = await jwtService.signAsync({
      sub: "user_2",
      email: "u2@test.dev",
      role: UserRole.REGULAR_USER,
    });
    accessTokenUser3 = await jwtService.signAsync({
      sub: "user_3",
      email: "u3@test.dev",
      role: UserRole.REGULAR_USER,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("saves message via POST /rooms/:id/messages for room member", async () => {
    const response = await request(app.getHttpServer())
      .post("/rooms/5db0da20-b916-4c44-8ad6-b4bea76f0ea5/messages")
      .set("Cookie", [`access_token=${accessTokenUser2}`])
      .send({ message: "Message from REST" })
      .expect(201);

    expect(response.body).toMatchObject({
      roomId: "5db0da20-b916-4c44-8ad6-b4bea76f0ea5",
      senderId: "user_2",
      message: "Message from REST",
      sender: { id: "user_2", fullName: "User Two", avatarUrl: null },
      isOwn: true,
    });
    expect(fakePrisma.messages).toHaveLength(1);
  });

  it("returns 403 when non-member tries to send a message", async () => {
    await request(app.getHttpServer())
      .post("/rooms/5db0da20-b916-4c44-8ad6-b4bea76f0ea5/messages")
      .set("Cookie", [`access_token=${accessTokenUser3}`])
      .send({ message: "Should fail" })
      .expect(403);
  });

  it("returns 400 for whitespace-only message", async () => {
    await request(app.getHttpServer())
      .post("/rooms/5db0da20-b916-4c44-8ad6-b4bea76f0ea5/messages")
      .set("Cookie", [`access_token=${accessTokenUser2}`])
      .send({ message: "   " })
      .expect(400);
  });

  it("returns existing private room for the same pair", async () => {
    const response = await request(app.getHttpServer())
      .post("/rooms")
      .set("Cookie", [`access_token=${accessTokenUser1}`])
      .send({ type: "private", memberIds: ["user_2"] })
      .expect(201);

    expect(response.body.id).toBe("5db0da20-b916-4c44-8ad6-b4bea76f0ea5");
    expect(response.body.type).toBe("private");
  });

  it("returns 400 for group room without name", async () => {
    await request(app.getHttpServer())
      .post("/rooms")
      .set("Cookie", [`access_token=${accessTokenUser1}`])
      .send({ type: "group", memberIds: ["user_2", "user_3"] })
      .expect(400);
  });

  it("broadcasts chat:newMessage via websocket for room members", async () => {
    const socketUser1 = io(`${baseUrl}/chat`, {
      transports: ["websocket"],
      auth: { token: accessTokenUser1 },
    });
    const socketUser2 = io(`${baseUrl}/chat`, {
      transports: ["websocket"],
      auth: { token: accessTokenUser2 },
    });

    try {
      await Promise.all([
        waitForEvent<void>(socketUser1, "connect"),
        waitForEvent<void>(socketUser2, "connect"),
      ]);

      socketUser1.emit("chat:joinRoom", {
        roomId: "5db0da20-b916-4c44-8ad6-b4bea76f0ea5",
      });
      socketUser2.emit("chat:joinRoom", {
        roomId: "5db0da20-b916-4c44-8ad6-b4bea76f0ea5",
      });
      await sleep(50);

      const incomingPromise = waitForEvent<
        Message & {
          sender: { id: string; fullName: string; avatarUrl: string | null };
        }
      >(socketUser2, "chat:newMessage");

      socketUser1.emit("chat:sendMessage", {
        roomId: "5db0da20-b916-4c44-8ad6-b4bea76f0ea5",
        message: "Message from WS",
      });

      const incoming = await incomingPromise;
      expect(incoming).toMatchObject({
        roomId: "5db0da20-b916-4c44-8ad6-b4bea76f0ea5",
        senderId: "user_1",
        message: "Message from WS",
        sender: { id: "user_1", fullName: "User One", avatarUrl: null },
      });
    } finally {
      socketUser1.close();
      socketUser2.close();
    }
  });
});
