import { IsIn } from "class-validator";

export class DecideTeamJoinRequestDto {
  @IsIn(["accept", "reject"])
  action!: "accept" | "reject";
}
