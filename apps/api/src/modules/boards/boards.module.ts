import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MentorGuard } from "../auth/guards/mentor.guard";
import { PrismaModule } from "../prisma/prisma.module";
import { TeamsModule } from "../teams/teams.module";
import { BoardsController } from "./boards.controller";
import { BoardsService } from "./boards.service";

@Module({
  imports: [PrismaModule, AuthModule, TeamsModule],
  controllers: [BoardsController],
  providers: [BoardsService, MentorGuard],
})
export class BoardsModule {}
