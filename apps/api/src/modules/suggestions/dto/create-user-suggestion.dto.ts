import { SuggestionPriority, SuggestionTargetScope } from "@prisma/client";
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserSuggestionDto {
  @IsEnum(SuggestionTargetScope)
  scope!: SuggestionTargetScope;

  @IsOptional()
  @IsString()
  @MinLength(1)
  teamId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  targetMentorId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  boardId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20_000)
  detail!: string;

  @IsEnum(SuggestionPriority)
  priority!: SuggestionPriority;
}
