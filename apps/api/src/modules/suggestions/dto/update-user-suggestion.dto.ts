import { SuggestionPriority } from "@prisma/client";
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserSuggestionDto {
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
