import { IsString, MaxLength, MinLength } from "class-validator";
import { CHAT_MESSAGE_MAX_LENGTH } from "../chat.constants";

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(CHAT_MESSAGE_MAX_LENGTH)
  message!: string;
}
