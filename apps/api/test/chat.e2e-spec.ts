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
    fakePrisma = new FakePrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma)
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
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
