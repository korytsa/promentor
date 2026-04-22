import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserBoardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsString()
  @MinLength(1)
  mentorId!: string;
}
