import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { throttlerOptionsFromEnv } from "./config/throttle.config";
import { AuthModule } from "./modules/auth/auth.module";
import { ChatModule } from "./modules/chat/chat.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { MentorshipModule } from "./modules/mentorship/mentorship.module";
import { MentorBroadcastModule } from "./modules/mentor-broadcast/mentor-broadcast.module";
import { SuggestionsModule } from "./modules/suggestions/suggestions.module";
import { TeamsModule } from "./modules/teams/teams.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule.forRootAsync({
      useFactory: () => throttlerOptionsFromEnv(),
    }),
    AuthModule,
    ChatModule,
    UsersModule,
    TeamsModule,
    MentorshipModule,
    MentorBroadcastModule,
    SuggestionsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
