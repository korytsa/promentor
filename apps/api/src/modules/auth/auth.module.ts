import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JWT_ACCESS_EXPIRES_IN_SECONDS } from "./config/auth-session.config";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (jwtSecret) {
    return jwtSecret;
  }

  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    return "dev-secret-change-me";
  }

  throw new Error("JWT_SECRET must be set outside development.");
}

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: getJwtSecret(),
      signOptions: {
        expiresIn: JWT_ACCESS_EXPIRES_IN_SECONDS,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
