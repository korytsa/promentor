import { JwtModule } from "@nestjs/jwt";
import { JwtService } from "@nestjs/jwt";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ThrottlerModule } from "@nestjs/throttler";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import {
  applyHttpAppSetup,
  applyTrustProxy,
} from "../src/bootstrap/http-app-setup";
import { AppModule } from "../src/app.module";
import { JWT_ACCESS_EXPIRES_IN_SECONDS } from "../src/modules/auth/config/auth-session.config";
import { PrismaModule } from "../src/modules/prisma/prisma.module";
import { PrismaService } from "../src/modules/prisma/prisma.service";
import { UsersModule } from "../src/modules/users/users.module";
import { FakePrismaService } from "./fake-prisma.e2e";

describe("Users search (e2e)", () => {
  let app: NestExpressApplication;
  let jwtService: JwtService;
  let accessTokenUser1: string;
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
    jwtService = app.get(JwtService);
    accessTokenUser1 = await jwtService.signAsync({
      sub: "user_1",
      email: "u1@test.dev",
      role: UserRole.MENTOR,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns users matching fullName, excluding current user", async () => {
    const res = await request(app.getHttpServer())
      .get("/users/search")
      .query({ q: "Two" })
      .set("Cookie", [`access_token=${accessTokenUser1}`])
      .expect(200);

    expect(res.body).toEqual([
      {
        id: "user_2",
        fullName: "User Two",
        avatarUrl: null,
        jobTitle: "Designer",
      },
    ]);
  });

  it("returns users matching jobTitle", async () => {
    const res = await request(app.getHttpServer())
      .get("/users/search")
      .query({ q: "Designer" })
      .set("Cookie", [`access_token=${accessTokenUser1}`])
      .expect(200);

    expect(res.body).toEqual([
      {
        id: "user_2",
        fullName: "User Two",
        avatarUrl: null,
        jobTitle: "Designer",
      },
    ]);
  });

  it("returns 401 without access token", async () => {
    const res = await request(app.getHttpServer())
      .get("/users/search")
      .query({ q: "Two" })
      .expect(401);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 401,
      message: "Missing access token",
      error: "Unauthorized",
    });
  });

  it("returns 400 for empty search query", async () => {
    const res = await request(app.getHttpServer())
      .get("/users/search")
      .query({ q: "   " })
      .set("Cookie", [`access_token=${accessTokenUser1}`])
      .expect(400);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 400,
      message: expect.any(String),
      error: "Bad Request",
    });
  });
});

describe("GET /users pagination (e2e)", () => {
  let app: NestExpressApplication;
  let accessToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "development";
    const fakePrisma = new FakePrismaService();

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
    accessToken = await jwtService.signAsync({
      sub: "user_1",
      email: "u1@test.dev",
      role: UserRole.MENTOR,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns a paginated users page", async () => {
    const res = await request(app.getHttpServer())
      .get("/users")
      .query({ limit: 1, offset: 1 })
      .set("Cookie", [`access_token=${accessToken}`])
      .expect(200);

    expect(res.body).toEqual({
      items: [
        {
          id: "user_3",
          fullName: "User Three",
          email: "u3@test.dev",
          role: "REGULAR_USER",
          avatarUrl: null,
          jobTitle: null,
          about: null,
        },
      ],
      total: 3,
      limit: 1,
      offset: 1,
    });
  });
});

describe("Users me endpoints (e2e)", () => {
  let app: NestExpressApplication;
  let fakePrisma: FakePrismaService;
  let existingUserToken: string;
  let missingUserToken: string;

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
    existingUserToken = await jwtService.signAsync({
      sub: "user_1",
      email: "u1@test.dev",
      role: UserRole.MENTOR,
    });
    missingUserToken = await jwtService.signAsync({
      sub: "missing_user",
      email: "missing@test.dev",
      role: UserRole.MENTOR,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns all validation messages for invalid profile updates", async () => {
    const res = await request(app.getHttpServer())
      .patch("/users/me")
      .set("Cookie", [`access_token=${existingUserToken}`])
      .send({
        fullName: "ab",
        avatarUrl: "not-a-url",
      })
      .expect(400);

    expect(res.body.message).toBe(
      "fullName must be longer than or equal to 3 characters",
    );
    expect(res.body.errors).toEqual([
      "fullName must be longer than or equal to 3 characters",
      "avatarUrl must be a PNG, JPEG, GIF, or WebP data URL from an uploaded image",
    ]);
  });

  it("returns 404 when updating a deleted or missing user", async () => {
    const res = await request(app.getHttpServer())
      .patch("/users/me")
      .set("Cookie", [`access_token=${missingUserToken}`])
      .send({ fullName: "Updated Missing User" })
      .expect(404);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 404,
      message: "User not found",
      error: "Not Found",
    });
  });

  it("returns 404 when deleting a deleted or missing user", async () => {
    const res = await request(app.getHttpServer())
      .delete("/users/me")
      .set("Cookie", [`access_token=${missingUserToken}`])
      .expect(404);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 404,
      message: "User not found",
      error: "Not Found",
    });
  });

  it("does not map unrelated Prisma errors to 404", async () => {
    const prismaError = new Error("Unique constraint failed") as Error & {
      code: string;
    };
    prismaError.code = "P2002";
    fakePrisma.userUpdateError = prismaError;
    try {
      const res = await request(app.getHttpServer())
        .patch("/users/me")
        .set("Cookie", [`access_token=${existingUserToken}`])
        .send({ fullName: "Still Valid Name" })
        .expect(500);

      expect(res.body).toMatchObject({
        success: false,
        statusCode: 500,
        message: "Internal server error",
        error: "InternalServerError",
      });
    } finally {
      fakePrisma.userUpdateError = null;
    }
  });
});

describe("GET /users/search throttling (e2e)", () => {
  let app: NestExpressApplication;
  let accessToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "development";
    const fakePrisma = new FakePrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60_000,
            limit: 2,
          },
        ]),
        JwtModule.register({
          global: true,
          secret: "dev-secret-change-me",
          signOptions: {
            expiresIn: JWT_ACCESS_EXPIRES_IN_SECONDS,
          },
        }),
        PrismaModule,
        UsersModule,
      ],
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
    accessToken = await jwtService.signAsync({
      sub: "user_1",
      email: "u1@test.dev",
      role: UserRole.MENTOR,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 429 when the short-term request limit is exceeded", async () => {
    const http = app.getHttpServer();
    const cookie = [`access_token=${accessToken}`];

    await request(http)
      .get("/users/search")
      .query({ q: "User" })
      .set("Cookie", cookie)
      .expect(200);

    await request(http)
      .get("/users/search")
      .query({ q: "User" })
      .set("Cookie", cookie)
      .expect(200);

    await request(http)
      .get("/users/search")
      .query({ q: "User" })
      .set("Cookie", cookie)
      .expect(429);
  });
});
