import { Module } from "@nestjs/common";
import { MentorGuard } from "../auth/guards/mentor.guard";
import { MentorshipModule } from "../mentorship/mentorship.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SuggestionsController } from "./suggestions.controller";
import { SuggestionsService } from "./suggestions.service";

@Module({
  imports: [PrismaModule, MentorshipModule],
  controllers: [SuggestionsController],
  providers: [SuggestionsService, MentorGuard],
})
export class SuggestionsModule {}
