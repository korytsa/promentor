import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { initAuthBridge } from "@/shared/auth/authBridge";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(createQueryClient);

  useEffect(() => {
    const cleanup = initAuthBridge(client);
    return cleanup;
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
