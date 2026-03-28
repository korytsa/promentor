import { Settings, UserIcon } from "lucide-react";
import type { AuthMode, AuthRoleOption, NavItem, UserRole } from "../types";

export const AUTH_LOGIN_REDIRECT_PATH = "/login/mentor";

const ROLE_CONFIG: Record<
  UserRole,
  { param: string; title: string; description: string; navItems: NavItem[] }
> = {
  MENTOR: {
    param: "mentor",
    title: "Mentor",
    description: "Team and content management with full platform access.",
    navItems: [
      { label: "Teams", to: "/teams" },
      { label: "Boards", to: "/boards" },
      { label: "Workout Plans", to: "/plans" },
      { label: "Chat", to: "/chat" },
    ],
  },
  REGULAR_USER: {
    param: "regular_user",
    title: "Regular User",
    description: "Explore teams, connect with mentors, and collaborate.",
    navItems: [
      { label: "Explore Teams", to: "/explore" },
      { label: "Mentors", to: "/mentors" },
      { label: "Chat", to: "/chat" },
      { label: "Suggestion", to: "/suggestion" },
    ],
  },
};

const ROLE_ORDER: UserRole[] = ["MENTOR", "REGULAR_USER"];

export const AUTH_ROLES: AuthRoleOption[] = ROLE_ORDER.map((role) => ({
  role,
  title: ROLE_CONFIG[role].title,
  description: ROLE_CONFIG[role].description,
}));

const ROLE_BY_PARAM: Record<string, UserRole> = Object.fromEntries(
  ROLE_ORDER.map((role) => [ROLE_CONFIG[role].param, role]),
) as Record<string, UserRole>;

const AUTH_ROLE_BY_ROLE: Record<UserRole, AuthRoleOption> = Object.fromEntries(
  AUTH_ROLES.map((item) => [item.role, item]),
) as Record<UserRole, AuthRoleOption>;

export const getRoleFromParam = (role: string | undefined): UserRole | null => {
  return role ? (ROLE_BY_PARAM[role] ?? null) : null;
};

export function getRoleParam(role: UserRole): string {
  return ROLE_CONFIG[role].param;
}

export function getAuthRoute(mode: AuthMode, role: UserRole): string {
  return `/${mode}/${getRoleParam(role)}`;
}

export function getOppositeAuthMode(mode: AuthMode): AuthMode {
  return mode === "login" ? "register" : "login";
}

export const getRoleContent = (role: UserRole): AuthRoleOption => {
  return AUTH_ROLE_BY_ROLE[role];
};

export function getUserRoleLabel(role: UserRole): string {
  return ROLE_CONFIG[role].title;
}

export const MENTOR_NAV_ITEMS: NavItem[] = ROLE_CONFIG.MENTOR.navItems;

export const REGULAR_USER_NAV_ITEMS: NavItem[] =
  ROLE_CONFIG.REGULAR_USER.navItems;

export const MENU_LINKS = [
  { to: "/profile", icon: UserIcon, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const getNavItems = (role: UserRole): NavItem[] => {
  return ROLE_CONFIG[role].navItems;
};

export const PLACEHOLDER_NAV_PATHS = [
  ...new Set([
    ...Object.values(ROLE_CONFIG).flatMap(({ navItems }) =>
      navItems.map((i) => i.to),
    ),
  ]),
].filter((to) => to !== "/chat");
