import { IsEmail } from "class-validator";
import { IsStrongPassword } from "../decorators/is-strong-password.decorator";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;
}
