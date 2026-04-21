import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MentorGuard } from "../auth/guards/mentor.guard";
import { TeamJoinRequestsController } from "./team-join-requests.controller";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";

@Module({
  imports: [AuthModule],
  controllers: [TeamsController, TeamJoinRequestsController],
  providers: [TeamsService, MentorGuard],
})
export class TeamsModule {}
