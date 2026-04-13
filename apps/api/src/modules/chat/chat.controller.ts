import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { MarkRoomReadDto } from "./dto/mark-room-read.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import {
  ChatMessageResponse,
  ChatMessagesPageResponse,
  ChatRoomDetailResponse,
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

  @Post(":id/read")
  @HttpCode(HttpStatus.NO_CONTENT)
  markRoomRead(
    @Param("id") roomId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: MarkRoomReadDto,
  ): Promise<void> {
    return this.chatService.markRoomRead(roomId, user.sub, dto);
  }

  @Get(":id")
  getRoom(
    @Param("id") roomId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ChatRoomDetailResponse> {
    return this.chatService.getRoomById(roomId, user.sub);
  }

  @Delete(":id/members/me")
  @HttpCode(HttpStatus.NO_CONTENT)
  leaveRoom(
    @Param("id") roomId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.chatService.leaveRoom(roomId, user.sub);
  }

  @Post()
  createRoom(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRoomDto,
  ): Promise<ChatRoomResponse> {
    return this.chatService.createRoom(user.sub, dto);
  }
}
