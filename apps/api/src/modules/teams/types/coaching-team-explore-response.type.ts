import type { CoachingTeamListItemResponse } from "./coaching-team-response.type";

export type ExploreJoinUi =
  | "send_request"
  | "pending"
  | "joined"
  | "declined"
  | "your_team"
  | "ineligible";

export type ExploreTeamRowResponse = CoachingTeamListItemResponse & {
  joinUi: ExploreJoinUi;
};
