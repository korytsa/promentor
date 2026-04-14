import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";

export class CreateRoomDto {
  @IsIn(["private", "group"])
  type!: "private" | "group";

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  memberIds!: string[];

  @ValidateIf((dto: CreateRoomDto) => dto.type === "group")
  @IsString()
  @MinLength(1)
  name?: string;
}
