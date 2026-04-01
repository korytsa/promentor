import { Module } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
  controllers: [ChatController],
  providers: [ChatService, JwtAuthGuard, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
