import type { UserResponse } from "./user-response.type";

export type UsersListResponse = {
  items: UserResponse[];
  total: number;
  limit: number;
  offset: number;
};
