import { Injectable } from "@nestjs/common";
import { ChatMessagesService } from "./chat-messages.service";
import { ChatRoomService } from "./chat-room.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { MarkRoomReadDto } from "./dto/mark-room-read.dto";
import { ListRoomMessagesQueryDto } from "./dto/list-room-messages.query";
import { SendMessageDto } from "./dto/send-message.dto";
import {
  ChatMessageResponse,
  ChatMessagesPageResponse,
  ChatRoomDetailResponse,
  ChatRoomListItemResponse,
  ChatRoomResponse,
} from "./types/chat-response.type";

@Injectable()
export class ChatService {
  constructor(
    private readonly rooms: ChatRoomService,
    private readonly messages: ChatMessagesService,
  ) {}

  listRooms(userId: string): Promise<ChatRoomListItemResponse[]> {
    return this.rooms.listRooms(userId);
  }

  getRoomById(roomId: string, userId: string): Promise<ChatRoomDetailResponse> {
    return this.rooms.getRoomById(roomId, userId);
  }

  leaveRoom(roomId: string, userId: string): Promise<void> {
    return this.rooms.leaveRoom(roomId, userId);
  }

  createRoom(userId: string, dto: CreateRoomDto): Promise<ChatRoomResponse> {
    return this.rooms.createRoom(userId, dto);
  }

  assertCanAccessRoom(roomId: string, userId: string): Promise<void> {
    return this.rooms.assertCanAccessRoom(roomId, userId);
  }

  listMessages(
    roomId: string,
    userId: string,
    query: ListRoomMessagesQueryDto,
  ): Promise<ChatMessagesPageResponse> {
    return this.messages.listMessages(roomId, userId, query);
  }

  sendMessage(
    roomId: string,
    userId: string,
    dto: SendMessageDto,
  ): Promise<ChatMessageResponse> {
    return this.messages.sendMessage(roomId, userId, dto);
  }

  markRoomRead(
    roomId: string,
    userId: string,
    dto: MarkRoomReadDto,
  ): Promise<void> {
    return this.messages.markRoomRead(roomId, userId, dto);
  }
}
