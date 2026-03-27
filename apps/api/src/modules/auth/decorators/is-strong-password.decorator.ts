import { applyDecorators } from "@nestjs/common";
import { IsString, Matches, MinLength } from "class-validator";

export function IsStrongPassword(): PropertyDecorator {
  return applyDecorators(
    IsString(),
    MinLength(8),
    Matches(/[A-Z]/, {
      message: "password must contain at least one uppercase letter",
    }),
    Matches(/\d/, { message: "password must contain at least one number" }),
  );
}
