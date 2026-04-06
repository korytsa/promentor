import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { UserRole } from "@prisma/client";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
