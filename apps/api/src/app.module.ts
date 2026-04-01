import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { ChatModule } from "./modules/chat/chat.module";
import { PrismaModule } from "./modules/prisma/prisma.module";

@Module({
  imports: [PrismaModule, AuthModule, ChatModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
