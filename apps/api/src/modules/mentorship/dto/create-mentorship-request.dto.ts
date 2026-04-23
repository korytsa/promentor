import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateMentorshipRequestDto {
  @IsString()
  @MinLength(1)
  mentorId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  message?: string;
}
