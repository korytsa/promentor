import { Module } from "@nestjs/common";
import { MentorGuard } from "../auth/guards/mentor.guard";
import { RegularUserGuard } from "../auth/guards/regular-user.guard";
import { PrismaModule } from "../prisma/prisma.module";
import { SuggestionsController } from "./suggestions.controller";
import { SuggestionsService } from "./suggestions.service";

@Module({
  imports: [PrismaModule],
  controllers: [SuggestionsController],
  providers: [SuggestionsService, MentorGuard, RegularUserGuard],
})
export class SuggestionsModule {}
