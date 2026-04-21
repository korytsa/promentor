import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class InviteRegularUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsEmail()
  email!: string;
}
