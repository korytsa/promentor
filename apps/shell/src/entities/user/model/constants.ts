import { NavItem, User, UserRole } from "../types";

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

export const MOCK_USER: User = {
  id: "1",
  fullName: "John Doe",
  avatarUrl:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100",
  role: "MENTOR",
  email: "john.doe@example.com",
};

export const getNavItems = (role: UserRole): NavItem[] => {
  return role === "MENTOR" ? MENTOR_NAV_ITEMS : REGULAR_USER_NAV_ITEMS;
};

export const navItems = MOCK_USER ? getNavItems(MOCK_USER.role) : [];
