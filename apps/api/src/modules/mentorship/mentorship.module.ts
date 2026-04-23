import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MentorGuard } from "../auth/guards/mentor.guard";
import { MentorshipRequestsController } from "./mentorship-requests.controller";
import { MentorsController } from "./mentors.controller";
import { MentorshipService } from "./mentorship.service";

@Module({
  imports: [AuthModule],
  controllers: [MentorsController, MentorshipRequestsController],
  providers: [MentorshipService, MentorGuard],
  exports: [MentorshipService],
})
export class MentorshipModule {}
