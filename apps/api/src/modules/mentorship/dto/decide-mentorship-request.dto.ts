import { IsIn } from "class-validator";

export class DecideMentorshipRequestDto {
  @IsIn(["accept", "reject"])
  action!: "accept" | "reject";
}
