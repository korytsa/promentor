import { MentorBroadcastScope } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateMentorBroadcastRequestDto {
  @IsEnum(MentorBroadcastScope)
  scope!: MentorBroadcastScope;

  @IsOptional()
  @IsString()
  @MinLength(1)
  teamId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  menteeId?: string;

  @IsOptional()
  @IsBoolean()
  allInterns?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  targetLabel?: string;
  @IsOptional()
  @IsString()
  @MaxLength(500)
  contextLine?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  body!: string;
}
