import type { UserRole } from "../types";
import type { NavItem } from "@/features/navigation-by-role";

export const MENTOR_NAV_ITEMS: NavItem[] = [
  { label: "Teams", to: "/teams" },
  { label: "Boards", to: "/boards" },
  { label: "Workout Plans", to: "/plans" },
  { label: "Chat", to: "/chat" },
];

export const REGULAR_USER_NAV_ITEMS: NavItem[] = [
  { label: "Explore Teams", to: "/explore" },
  { label: "Mentors", to: "/mentors" },
  { label: "Chat", to: "/chat" },
  { label: "Suggestion", to: "/suggestion" },
];

export const getNavItems = (role: UserRole): NavItem[] => {
  return role === "MENTOR" ? MENTOR_NAV_ITEMS : REGULAR_USER_NAV_ITEMS;
};
