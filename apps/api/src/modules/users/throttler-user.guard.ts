import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { AuthenticatedRequest } from "../auth/types/authenticated-request.type";

@Injectable()
export class ThrottlerUserGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const user = (req as unknown as AuthenticatedRequest).user;
    if (typeof user?.sub === "string" && user.sub.length > 0) {
      return `user:${user.sub}`;
    }
    return super.getTracker(req);
  }
}
