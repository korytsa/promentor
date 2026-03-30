import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { UserRole } from "@prisma/client";
import { IsStrongPassword } from "../decorators/is-strong-password.decorator";

export class RegisterDto {
  @IsString()
  @MinLength(3)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
