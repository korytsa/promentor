export type ChatRoomTypeResponse = "private" | "group";

export type ChatLastMessageResponse = {
  id: string;
  message: string;
  senderId: string;
  senderFullName: string;
  isOwn: boolean;
  createdAt: Date;
};

export type ChatRoomListItemResponse = {
  id: string;
  name: string | null;
  displayTitle: string;
  type: ChatRoomTypeResponse;
  updatedAt: Date;
  membersCount: number;
  avatarUrls: string[];
  lastMessage: ChatLastMessageResponse | null;
  unreadCount: number;
};

export type ChatMessageSenderPublic = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
};

export type ChatMessageResponse = {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: Date;
  sender: ChatMessageSenderPublic;
  isOwn: boolean;
};

export type ChatMessageBroadcastPayload = Omit<ChatMessageResponse, "isOwn">;

export function chatMessageToBroadcastPayload(
  m: ChatMessageResponse,
): ChatMessageBroadcastPayload {
  return {
    id: m.id,
    roomId: m.roomId,
    senderId: m.senderId,
    message: m.message,
    createdAt: m.createdAt,
    sender: m.sender,
  };
}

export type ChatMessagesPageResponse = {
  items: ChatMessageResponse[];
  total: number;
  limit: number;
  offset: number;
};

export type ChatRoomResponse = {
  id: string;
  name: string | null;
  type: ChatRoomTypeResponse;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  membersCount: number;
};

export type ChatRoomMemberPublic = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
};

export type ChatRoomDetailResponse = {
  id: string;
  name: string | null;
  displayTitle: string;
  type: ChatRoomTypeResponse;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  membersCount: number;
  avatarUrls: string[];
  members: ChatRoomMemberPublic[];
  membersOnlineCount: number;
  unreadCount: number;
};
