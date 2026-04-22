import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MentorGuard } from "../auth/guards/mentor.guard";
import { PrismaModule } from "../prisma/prisma.module";
import { TeamsModule } from "../teams/teams.module";
import { TacticalBoardsController } from "./tactical-boards.controller";
import { TacticalBoardsService } from "./tactical-boards.service";

@Module({
  imports: [PrismaModule, AuthModule, TeamsModule],
  controllers: [TacticalBoardsController],
  providers: [TacticalBoardsService, MentorGuard],
})
export class TacticalBoardsModule {}
