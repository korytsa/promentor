import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JWT_ACCESS_EXPIRES_IN_SECONDS } from "./config/auth-session.config";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GoogleStrategy } from "./strategies/google.strategy";

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

function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
    process.env.GOOGLE_CLIENT_SECRET?.trim() &&
    process.env.GOOGLE_CALLBACK_URL?.trim(),
  );
}

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({
      global: true,
      secret: getJwtSecret(),
      signOptions: {
        expiresIn: JWT_ACCESS_EXPIRES_IN_SECONDS,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    GoogleAuthGuard,
    ...(isGoogleOAuthConfigured() ? [GoogleStrategy] : []),
  ],
})
export class AuthModule {}
