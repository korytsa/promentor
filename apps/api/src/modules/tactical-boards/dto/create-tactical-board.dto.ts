import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateTacticalBoardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsString()
  @MinLength(1)
  teamId!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(10)
  sessionDate!: string;

  @IsIn(["hockey", "football"])
  boardType!: "hockey" | "football";

  @IsArray()
  objects!: unknown[];

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  stroke!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  strokeWidth!: number;
}
