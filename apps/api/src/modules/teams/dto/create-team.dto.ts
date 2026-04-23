import {
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateTeamDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  memberUserIds!: string[];
}
