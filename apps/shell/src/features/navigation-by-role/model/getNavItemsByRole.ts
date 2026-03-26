import type { UserRole } from "@/entities/user";
import type { NavItem } from "./types";

const mentorNavItems: NavItem[] = [
  { label: "Teams", to: "/teams" },
  { label: "Boards", to: "/boards" },
  { label: "Workout Plans", to: "/plans" },
  { label: "Chat", to: "/chat" },
];

const regularUserNavItems: NavItem[] = [
  { label: "Explore Teams", to: "/explore" },
  { label: "Mentors", to: "/mentors" },
  { label: "Chat", to: "/chat" },
  { label: "Suggestion", to: "/suggestion" },
];

export const getNavItemsByRole = (role: UserRole): NavItem[] => {
  return role === "MENTOR" ? mentorNavItems : regularUserNavItems;
};
