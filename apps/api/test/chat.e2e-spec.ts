import { JwtService } from "@nestjs/jwt";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import { io, type Socket } from "socket.io-client";
import {
  applyHttpAppSetup,
  applyTrustProxy,
} from "../src/bootstrap/http-app-setup";
import { AppModule } from "../src/app.module";
import { CHAT_CLIENT_MESSAGE_ID_MAX_LENGTH } from "../src/modules/chat/chat.constants";
import { PrismaService } from "../src/modules/prisma/prisma.service";
import {
  FakePrismaService,
  type FakeMessage as Message,
} from "./fake-prisma.e2e";

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

describe("Chat backend (e2e)", () => {
  let app: NestExpressApplication;
  let jwtService: JwtService;
  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let accessTokenUser3: string;
  let fakePrisma: FakePrismaService;
  let baseUrl: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "development";
    process.env.THROTTLE_LIMIT = "2";
    process.env.THROTTLE_TTL_MS = "60000";
    fakePrisma = new FakePrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma)
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>({
      bodyParser: false,
    });
    applyTrustProxy(app);
    applyHttpAppSetup(app);

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

  it("returns 201 with clientMessageId when provided via REST", async () => {
    const response = await request(app.getHttpServer())
      .post("/rooms/5db0da20-b916-4c44-8ad6-b4bea76f0ea5/messages")
      .set("Cookie", [`access_token=${accessTokenUser2}`])
      .send({ message: "With correlation id", clientMessageId: "rest-corr-1" })
      .expect(201);

    expect(response.body.clientMessageId).toBe("rest-corr-1");
  });

  it("returns 400 when clientMessageId is not a string (REST)", async () => {
    await request(app.getHttpServer())
      .post("/rooms/5db0da20-b916-4c44-8ad6-b4bea76f0ea5/messages")
      .set("Cookie", [`access_token=${accessTokenUser2}`])
      .send({ message: "x", clientMessageId: 123 })
      .expect(400);
  });

  it("returns 400 when clientMessageId exceeds max length (REST)", async () => {
    const tooLong = "x".repeat(CHAT_CLIENT_MESSAGE_ID_MAX_LENGTH + 1);
    await request(app.getHttpServer())
      .post("/rooms/5db0da20-b916-4c44-8ad6-b4bea76f0ea5/messages")
      .set("Cookie", [`access_token=${accessTokenUser2}`])
      .send({ message: "x", clientMessageId: tooLong })
      .expect(400);
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

  it("returns 400 when room id is not a valid UUID", async () => {
    await request(app.getHttpServer())
      .get("/rooms/not-a-uuid/messages")
      .set("Cookie", [`access_token=${accessTokenUser2}`])
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

  it("emits rooms:changed to all members on new message (personal channel; no chat:joinRoom required)", async () => {
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

      const roomId = "5db0da20-b916-4c44-8ad6-b4bea76f0ea5";
      const p1 = waitForEvent<{
        type: string;
        reason: string;
        roomId: string;
        updatedAt: string;
      }>(socketUser1, "rooms:changed");
      const p2 = waitForEvent<{
        type: string;
        reason: string;
        roomId: string;
        updatedAt: string;
      }>(socketUser2, "rooms:changed");

      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/messages`)
        .set("Cookie", [`access_token=${accessTokenUser1}`])
        .send({ message: "rooms list invalidation" })
        .expect(201);

      const [a, b] = await Promise.all([p1, p2]);
      expect(a).toMatchObject({
        type: "rooms:changed",
        reason: "new_message",
        roomId,
      });
      expect(b).toMatchObject({
        type: "rooms:changed",
        reason: "new_message",
        roomId,
      });
      expect(typeof a.updatedAt).toBe("string");
      expect(typeof b.updatedAt).toBe("string");
    } finally {
      socketUser1.close();
      socketUser2.close();
    }
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

  it("sends clientMessageId only to sender on chat:newMessage (not to other room members)", async () => {
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

      const roomId = "5db0da20-b916-4c44-8ad6-b4bea76f0ea5";
      socketUser1.emit("chat:joinRoom", { roomId });
      socketUser2.emit("chat:joinRoom", { roomId });
      await sleep(50);

      const pSender = waitForEvent<{
        clientMessageId?: string;
        message: string;
      }>(socketUser1, "chat:newMessage");
      const pOther = waitForEvent<{ clientMessageId?: string }>(
        socketUser2,
        "chat:newMessage",
      );

      socketUser1.emit("chat:sendMessage", {
        roomId,
        message: "With WS correlation",
        clientMessageId: "ws-opt-1",
      });

      const [fromSender, fromOther] = await Promise.all([pSender, pOther]);

      expect(fromSender.clientMessageId).toBe("ws-opt-1");
      expect(fromOther.clientMessageId).toBeUndefined();
    } finally {
      socketUser1.close();
      socketUser2.close();
    }
  });

  it("emits chat:error when WS clientMessageId is not a string", async () => {
    const roomId = "5db0da20-b916-4c44-8ad6-b4bea76f0ea5";
    const socket = io(`${baseUrl}/chat`, {
      transports: ["websocket"],
      auth: { token: accessTokenUser2 },
    });
    try {
      await waitForEvent<void>(socket, "connect");
      socket.emit("chat:joinRoom", { roomId });
      await sleep(50);

      const err = waitForEvent<{ message: string }>(socket, "chat:error");
      socket.emit("chat:sendMessage", {
        roomId,
        message: "valid body",
        clientMessageId: 999,
      } as never);

      const payload = await err;
      expect(payload.message).toMatch(/clientMessageId must be a string/i);
    } finally {
      socket.close();
    }
  });

  it("emits chat:error and disconnects when access token is missing", async () => {
    const socket = io(`${baseUrl}/chat`, {
      transports: ["websocket"],
    });
    try {
      const payload = await waitForEvent<{ message: string }>(
        socket,
        "chat:error",
      );
      expect(payload.message).toMatch(/Missing access token/i);
    } finally {
      socket.close();
    }
  });

  it("emits chat:error and disconnects when token is invalid", async () => {
    const socket = io(`${baseUrl}/chat`, {
      transports: ["websocket"],
      auth: { token: "not-a-valid-jwt" },
    });
    try {
      const payload = await waitForEvent<{ message: string }>(
        socket,
        "chat:error",
      );
      expect(payload.message).toMatch(/Invalid or expired token/i);
    } finally {
      socket.close();
    }
  });

  it("emits chat:error and does not persist message when send is throttled", async () => {
    const roomId = "5db0da20-b916-4c44-8ad6-b4bea76f0ea5";
    const before = fakePrisma.messages.length;
    const socket = io(`${baseUrl}/chat`, {
      transports: ["websocket"],
      auth: { token: accessTokenUser2 },
    });
    try {
      await waitForEvent<void>(socket, "connect");
      socket.emit("chat:joinRoom", { roomId });
      await sleep(50);
      socket.emit("chat:sendMessage", { roomId, message: "first" });
      socket.emit("chat:sendMessage", { roomId, message: "second" });
      socket.emit("chat:sendMessage", { roomId, message: "third" });
      const payload = await waitForEvent<{ message: string }>(
        socket,
        "chat:error",
      );
      expect(payload.message).toMatch(/Too many messages|slow down/i);
      await sleep(100);
      expect(fakePrisma.messages.length).toBe(before + 2);
    } finally {
      socket.close();
    }
  });

  it("does not move lastReadAt backward when marking an older message", async () => {
    const roomId = "5db0da20-b916-4c44-8ad6-b4bea76f0ea5";
    const older = await request(app.getHttpServer())
      .post(`/rooms/${roomId}/messages`)
      .set("Cookie", [`access_token=${accessTokenUser1}`])
      .send({ message: "older line" })
      .expect(201);
    await sleep(5);
    const newer = await request(app.getHttpServer())
      .post(`/rooms/${roomId}/messages`)
      .set("Cookie", [`access_token=${accessTokenUser1}`])
      .send({ message: "newer line" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/rooms/${roomId}/read`)
      .set("Cookie", [`access_token=${accessTokenUser2}`])
      .send({ messageId: newer.body.id })
      .expect(204);

    const afterNewer = fakePrisma.members.find(
      (m) => m.roomId === roomId && m.userId === "user_2",
    )!.lastReadAt!;

    await request(app.getHttpServer())
      .post(`/rooms/${roomId}/read`)
      .set("Cookie", [`access_token=${accessTokenUser2}`])
      .send({ messageId: older.body.id })
      .expect(204);

    const afterOlder = fakePrisma.members.find(
      (m) => m.roomId === roomId && m.userId === "user_2",
    )!.lastReadAt!;

    expect(afterOlder.getTime()).toBe(afterNewer.getTime());
  });
});
