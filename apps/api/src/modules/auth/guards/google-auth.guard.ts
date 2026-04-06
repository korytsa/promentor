import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { encodeGoogleAuthState } from "../utils/google-auth-state.util";

function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
    process.env.GOOGLE_CLIENT_SECRET?.trim() &&
    process.env.GOOGLE_CALLBACK_URL?.trim(),
  );
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  canActivate(context: ExecutionContext) {
    if (!isGoogleOAuthConfigured()) {
      throw new ServiceUnavailableException(
        "Google login is not configured on the server.",
      );
    }
    return super.canActivate(context);
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      query?: { role?: string; mode?: string };
      path?: string;
      originalUrl?: string;
    }>();

    const isCallbackRequest =
      request.path?.includes("/auth/google/callback") ||
      request.originalUrl?.includes("/auth/google/callback");

    if (isCallbackRequest) {
      return { scope: ["email", "profile"] };
    }

    const query = request.query ?? {};
    return {
      scope: ["email", "profile"],
      state: encodeGoogleAuthState({ role: query.role, mode: query.mode }),
    };
  }
}
