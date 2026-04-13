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
};

export type ChatMessageResponse = {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: Date;
};

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
