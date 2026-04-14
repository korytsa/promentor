import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { createCorsOptions } from "../config/cors.config";

export function applyTrustProxy(app: NestExpressApplication): void {
  const raw = process.env.TRUST_PROXY?.trim();
  if (!raw || raw === "false" || raw === "0") {
    return;
  }
  if (raw === "true" || raw === "1") {
    app.set("trust proxy", true);
    return;
  }
  const num = Number.parseInt(raw, 10);
  if (!Number.isNaN(num) && num > 0) {
    app.set("trust proxy", num);
  }
}

export function applyHttpAppSetup(app: NestExpressApplication): void {
  app.use(cookieParser());
  app.enableCors(createCorsOptions());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
