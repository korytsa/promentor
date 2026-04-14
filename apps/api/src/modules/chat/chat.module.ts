import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatMessagesService } from "./chat-messages.service";
import { ChatPresenceService } from "./chat-presence.service";
import { ChatRoomService } from "./chat-room.service";
import { ChatSocketThrottleService } from "./chat-socket-throttle.service";
import { ChatService } from "./chat.service";

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [
    ChatRoomService,
    ChatMessagesService,
    ChatService,
    ChatPresenceService,
    ChatSocketThrottleService,
    ChatGateway,
  ],
  exports: [ChatService],
})
export class ChatModule {}
