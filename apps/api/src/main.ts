import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { applyHttpAppSetup, applyTrustProxy } from "./bootstrap/http-app-setup";
import { runPrismaMigrateDeployIfProduction } from "./bootstrap/run-prisma-migrate";
import { AppModule } from "./app.module";

async function bootstrap() {
  runPrismaMigrateDeployIfProduction();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  applyTrustProxy(app);
  applyHttpAppSetup(app);

  const port = process.env.PORT ?? "3000";
  await app.listen(port);
}

bootstrap();
