export type RoomsChangedReason =
  | "room_created"
  | "new_message"
  | "room_updated"
  | "left_room";

export type RoomsChangedPayload = {
  type: "rooms:changed";
  reason: RoomsChangedReason;
  roomId: string;
  updatedAt: string;
};
