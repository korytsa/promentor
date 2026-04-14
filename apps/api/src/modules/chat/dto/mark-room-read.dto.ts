import { IsOptional, IsUUID } from "class-validator";

export class MarkRoomReadDto {
  @IsOptional()
  @IsUUID()
  messageId?: string;
}
