import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { ChatService } from "./chat.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { ListRoomMessagesQueryDto } from "./dto/list-room-messages.query";
import { SendMessageDto } from "./dto/send-message.dto";
import {
  ChatMessageResponse,
  ChatMessagesPageResponse,
  ChatRoomListItemResponse,
  ChatRoomResponse,
} from "./types/chat-response.type";

@UseGuards(JwtAuthGuard)
@Controller("rooms")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  listRooms(
    @CurrentUser() user: JwtPayload,
  ): Promise<ChatRoomListItemResponse[]> {
    return this.chatService.listRooms(user.sub);
  }

  @Get(":id/messages")
  listRoomMessages(
    @Param("id") roomId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: ListRoomMessagesQueryDto,
  ): Promise<ChatMessagesPageResponse> {
    return this.chatService.listMessages(roomId, user.sub, query);
  }

  @Post(":id/messages")
  sendRoomMessage(
    @Param("id") roomId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendMessageDto,
  ): Promise<ChatMessageResponse> {
    return this.chatService.sendMessage(roomId, user.sub, dto);
  }

  @Post()
  createRoom(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRoomDto,
  ): Promise<ChatRoomResponse> {
    return this.chatService.createRoom(user.sub, dto);
  }
}
