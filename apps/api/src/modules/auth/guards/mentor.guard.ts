import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { AuthenticatedRequest } from "../types/authenticated-request.type";

@Injectable()
export class MentorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || user.role !== UserRole.MENTOR) {
      throw new ForbiddenException("Only mentors can perform this action");
    }

    return true;
  }
}
