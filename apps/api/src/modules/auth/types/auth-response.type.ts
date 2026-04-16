import type { OkResponse } from "../../../common/http/api-response";
import type { UserResponse } from "../../users/types/user-response.type";

export type AuthUserResponse = UserResponse;

export interface AuthSessionResponse {
  message: string;
  user: AuthUserResponse;
}

export type { OkResponse };
