import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtService } from "@nestjs/jwt";
import { ThrottlerModule } from "@nestjs/throttler";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { JWT_ACCESS_EXPIRES_IN_SECONDS } from "../src/modules/auth/config/auth-session.config";
import { PrismaModule } from "../src/modules/prisma/prisma.module";
import { PrismaService } from "../src/modules/prisma/prisma.service";
import { UsersModule } from "../src/modules/users/users.module";
import { FakePrismaService } from "./fake-prisma.e2e";

describe("Users search (e2e)", () => {
  let app: INestApplication;
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

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

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
    await request(app.getHttpServer())
      .get("/users/search")
      .query({ q: "Two" })
      .expect(401);
  });

  it("returns 400 for empty search query", async () => {
    await request(app.getHttpServer())
      .get("/users/search")
      .query({ q: "   " })
      .set("Cookie", [`access_token=${accessTokenUser1}`])
      .expect(400);
  });
});

describe("GET /users/search throttling (e2e)", () => {
  let app: INestApplication;
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

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

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
