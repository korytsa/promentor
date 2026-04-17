import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";

const JSON_BODY_LIMIT = "6mb";
import { ApiExceptionFilter } from "../common/http/api-exception.filter";
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
  app.use(json({ limit: JSON_BODY_LIMIT }));
  app.use(urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));
  app.use(cookieParser());
  app.enableCors(createCorsOptions());
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors
          .flatMap((error) => Object.values(error.constraints ?? {}))
          .filter((message): message is string => typeof message === "string");

        return new BadRequestException(
          messages.length > 0 ? messages : "Validation failed",
        );
      },
    }),
  );
}
