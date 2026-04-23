import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateTeamJoinRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  message?: string;
}
