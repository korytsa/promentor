import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class UpdateTacticalBoardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  teamId?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(10)
  sessionDate?: string;

  @IsOptional()
  @IsIn(["hockey", "football"])
  boardType?: "hockey" | "football";

  @IsOptional()
  @IsArray()
  objects?: unknown[];

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  stroke?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  strokeWidth?: number;
}
