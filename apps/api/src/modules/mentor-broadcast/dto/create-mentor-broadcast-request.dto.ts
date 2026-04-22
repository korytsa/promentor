import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateMentorBroadcastRequestDto {
  @IsIn(["TEAM", "INTERN", "BOARD"])
  scope!: "TEAM" | "INTERN" | "BOARD";

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
