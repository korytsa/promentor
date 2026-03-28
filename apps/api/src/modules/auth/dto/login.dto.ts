import { IsEmail, IsEnum } from "class-validator";
import { UserRole } from "@prisma/client";
import { IsStrongPassword } from "../decorators/is-strong-password.decorator";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
