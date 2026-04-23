import { JwtService } from "@nestjs/jwt";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import { MentorBroadcastScope, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import {
  applyHttpAppSetup,
  applyTrustProxy,
} from "../src/bootstrap/http-app-setup";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/modules/prisma/prisma.service";
import { FakePrismaService } from "./fake-prisma.e2e";

describe("Mentor broadcast BOARD scope (e2e)", () => {
  let app: NestExpressApplication;
  let accessTokenMentor: string;
  let fakePrisma: FakePrismaService;

  beforeAll(async () => {
    process.env.NODE_ENV = "development";
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

    await app.init();
    const jwtService = app.get(JwtService);
    accessTokenMentor = await jwtService.signAsync({
      sub: "user_1",
      email: "u1@test.dev",
      role: UserRole.MENTOR,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates a broadcast when boardId is valid for the mentor", async () => {
    const before = fakePrisma.mentorBroadcastRequests.length;
    const res = await request(app.getHttpServer())
      .post("/mentor-broadcast-requests")
      .set("Cookie", [`access_token=${accessTokenMentor}`])
      .send({
        scope: MentorBroadcastScope.BOARD,
        boardId: "board_ok_e2e",
        body: "Hello board members",
      })
      .expect(201);

    expect(res.body).toMatchObject({
      scope: MentorBroadcastScope.BOARD,
      boardId: "board_ok_e2e",
      teamId: null,
      menteeId: null,
      targetLabel: "Mentor One Board",
      body: "Hello board members",
      status: "DELIVERED",
    });
    expect(typeof res.body.id).toBe("string");
    expect(typeof res.body.createdAt).toBe("string");
    expect(typeof res.body.updatedAt).toBe("string");
    expect(fakePrisma.mentorBroadcastRequests).toHaveLength(before + 1);
  });

  it("returns 404 when boardId belongs to another mentor", async () => {
    const res = await request(app.getHttpServer())
      .post("/mentor-broadcast-requests")
      .set("Cookie", [`access_token=${accessTokenMentor}`])
      .send({
        scope: MentorBroadcastScope.BOARD,
        boardId: "board_foreign_e2e",
        body: "Should not send",
      })
      .expect(404);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 404,
      message: "Board not found or not available to you",
      error: "Not Found",
    });
  });

  it("returns 404 when boardId does not exist", async () => {
    const res = await request(app.getHttpServer())
      .post("/mentor-broadcast-requests")
      .set("Cookie", [`access_token=${accessTokenMentor}`])
      .send({
        scope: MentorBroadcastScope.BOARD,
        boardId: "board_missing_e2e",
        body: "Should not send",
      })
      .expect(404);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 404,
      message: "Board not found or not available to you",
      error: "Not Found",
    });
  });
});
