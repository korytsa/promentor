import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { initAuthBridge } from "@/shared/auth/authBridge";
import { getErrorMessage } from "@/shared/api/getErrorMessage";

const ERROR_TOAST_FALLBACK = "Something went wrong. Please try again." as const;

function readErrorToastId(
  meta: { notifyErrorToastId?: string } | undefined,
): string | undefined {
  const id = meta?.notifyErrorToastId;
  return typeof id === "string" && id.length > 0 ? id : undefined;
}

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const toastId = readErrorToastId(query.meta);
        if (toastId) {
          toast.error(getErrorMessage(error, ERROR_TOAST_FALLBACK), {
            toastId,
          });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const toastId = readErrorToastId(mutation.meta);
        if (toastId) {
          toast.error(getErrorMessage(error, ERROR_TOAST_FALLBACK), {
            toastId,
          });
        }
      },
    }),
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
