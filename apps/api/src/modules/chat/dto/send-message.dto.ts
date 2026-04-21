import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import {
  CHAT_CLIENT_MESSAGE_ID_MAX_LENGTH,
  CHAT_MESSAGE_MAX_LENGTH,
} from "../chat.constants";

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(CHAT_MESSAGE_MAX_LENGTH)
  message!: string;

  /** Correlation id from the client for optimistic updates (not persisted). */
  @IsOptional()
  @IsString()
  @MaxLength(CHAT_CLIENT_MESSAGE_ID_MAX_LENGTH)
  clientMessageId?: string;
}
