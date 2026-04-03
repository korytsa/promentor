import type { QueryClient } from "@tanstack/react-query";
import type { User } from "@/entities/user/types";
import { authQueryKeys } from "@/features/auth/api";
import { authLogout } from "@/shared/api/generated/api";

export type AuthUser = Pick<User, "id" | "email" | "fullName" | "role">;

export type AuthSession = {
  isAuthenticated: boolean;
  user: AuthUser | null;
};

export type AuthBridge = {
  getSession: () => AuthSession;
  subscribe: (listener: (session: AuthSession) => void) => () => void;
  logout: () => Promise<void>;
};

const listeners = new Set<(session: AuthSession) => void>();

let queryClientRef: QueryClient | null = null;
let unsubscribeQueryCache: (() => void) | null = null;
let lastSession: AuthSession = { isAuthenticated: false, user: null };

function toAuthSession(user: User | null | undefined): AuthSession {
  if (!user) {
    return { isAuthenticated: false, user: null };
  }

  return {
    isAuthenticated: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  };
}

function readSessionFromCache(queryClient: QueryClient): AuthSession {
  const user = queryClient.getQueryData<User | null>(authQueryKeys.session());
  return toAuthSession(user);
}

function notify(session: AuthSession) {
  listeners.forEach((listener) => {
    listener(session);
  });
}

function syncAndNotify(session: AuthSession) {
  if (
    lastSession.isAuthenticated === session.isAuthenticated &&
    lastSession.user?.id === session.user?.id &&
    lastSession.user?.email === session.user?.email &&
    lastSession.user?.fullName === session.user?.fullName &&
    lastSession.user?.role === session.user?.role
  ) {
    return;
  }

  lastSession = session;
  notify(session);
}

export function initAuthBridge(queryClient: QueryClient) {
  queryClientRef = queryClient;
  syncAndNotify(readSessionFromCache(queryClient));

  if (unsubscribeQueryCache) {
    unsubscribeQueryCache();
  }

  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== "updated") {
      return;
    }

    const key = event.query.queryKey;
    if (key[0] !== "auth" || key[1] !== "session") {
      return;
    }

    syncAndNotify(readSessionFromCache(queryClient));
  });

  unsubscribeQueryCache = unsubscribe;

  return () => {
    if (unsubscribeQueryCache === unsubscribe) {
      unsubscribeQueryCache = null;
    }
    unsubscribe();
  };
}

export const authBridge: AuthBridge = {
  getSession: () => {
    if (queryClientRef) {
      lastSession = readSessionFromCache(queryClientRef);
    }
    return lastSession;
  },
  subscribe: (listener) => {
    listeners.add(listener);
    listener(authBridge.getSession());

    return () => {
      listeners.delete(listener);
    };
  },
  logout: async () => {
    if (!queryClientRef) {
      throw new Error("Auth bridge is not initialized");
    }

    try {
      await authLogout();
    } finally {
      queryClientRef.setQueryData(authQueryKeys.session(), null);
    }
  },
};
