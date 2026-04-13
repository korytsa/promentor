import { Module } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatPresenceService } from "./chat-presence.service";
import { ChatService } from "./chat.service";

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatPresenceService, JwtAuthGuard, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
