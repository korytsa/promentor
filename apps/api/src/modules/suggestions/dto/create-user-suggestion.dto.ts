import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserSuggestionDto {
  @IsIn(["TEAM", "MENTOR", "BOARD"])
  scope!: "TEAM" | "MENTOR" | "BOARD";

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

  @IsIn(["HIGH", "MEDIUM", "LOW"])
  priority!: "HIGH" | "MEDIUM" | "LOW";
}
