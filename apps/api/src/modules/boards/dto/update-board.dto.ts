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
import {
  type BoardTypeClient,
  BOARD_TYPE_CLIENT,
} from "../constants/boards.constants";

export class UpdateBoardDto {
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
  @IsIn([...BOARD_TYPE_CLIENT])
  boardType?: BoardTypeClient;

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
