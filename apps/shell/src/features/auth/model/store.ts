import { create } from "zustand";
import { User, UserRole } from "@/entities/user/types";
import { LoginFormValues, RegisterFormValues } from "./schema";
import { AUTH_TOKEN_KEY } from "./constants";

type AuthValues = LoginFormValues | RegisterFormValues;

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  initializeAuth: () => Promise<void>;
  authorize: (role: UserRole, values?: AuthValues) => Promise<void>;
  logout: () => void;
}

const createDisplayName = (values?: AuthValues) => {
  if (!values) {
    return "ProMentor User";
  }

  if ("fullName" in values) {
    return values.fullName;
  }

  return values.email.split("@")[0] || "ProMentor User";
};

// TODO(auth): remove mock token flow after backend login/token endpoints are integrated.
const createMockToken = (user: User) => {
  const payload = JSON.stringify(user);
  return `dev-token.${btoa(payload)}`;
};

const parseMockToken = (token: string): User | null => {
  if (!token.startsWith("dev-token.")) {
    return null;
  }

  try {
    const encodedPayload = token.slice("dev-token.".length);
    const payload = atob(encodedPayload);
    return JSON.parse(payload) as User;
  } catch {
    return null;
  }
};

const fetchUserProfile = async (token: string): Promise<User> => {
  const devUser = parseMockToken(token);
  if (devUser) {
    return devUser;
  }

  // TODO(auth): align /auth/profile endpoint with backend contract once auth module is implemented.
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return (await response.json()) as User;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  initializeAuth: async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isInitializing: false,
      });
      return;
    }

    set({ isInitializing: true });

    try {
      const user = await fetchUserProfile(token);
      set({ token, user, isAuthenticated: true, isInitializing: false });
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },
  authorize: async (role, values) => {
    const user: User = {
      id: crypto.randomUUID(),
      fullName: createDisplayName(values),
      email: values?.email ?? "user@promentor.local",
      role,
    };

    const token = createMockToken(user);
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    const profile = await fetchUserProfile(token);
    set({ token, user: profile, isAuthenticated: true, isInitializing: false });
  },
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
