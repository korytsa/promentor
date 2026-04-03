import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { User, UserRole } from "@/entities/user/types";
import {
  authMe,
  useAuthLogin,
  useAuthLogout,
  useAuthRegister,
  type AuthUserResponseDto,
  type authLoginResponse,
  type authRegisterResponse,
} from "@/shared/api/generated/api";
import type { LoginFormValues, RegisterFormValues } from "../model/schema";

export const authQueryKeys = {
  session: () => ["auth", "session"] as const,
};

function dtoToUser(dto: AuthUserResponseDto): User {
  return {
    id: dto.id,
    fullName: dto.fullName,
    email: dto.email,
    role: dto.role,
  };
}

function setSessionFromUser(
  queryClient: QueryClient,
  user: AuthUserResponseDto,
) {
  queryClient.setQueryData(authQueryKeys.session(), dtoToUser(user));
}

function clearSessionCache(queryClient: QueryClient) {
  queryClient.setQueryData(authQueryKeys.session(), null);
}

export function useSessionQuery() {
  return useQuery({
    queryKey: authQueryKeys.session(),
    staleTime: 30_000,
    queryFn: async (): Promise<User | null> => {
      const res = await authMe();
      if (res.status === 401) {
        return null;
      }
      return dtoToUser(res.data);
    },
  });
}

type LoginVariables = { values: LoginFormValues; role: UserRole };

function toLoginBody(variables: LoginVariables) {
  return {
    data: {
      email: variables.values.email,
      password: variables.values.password,
      role: variables.role,
    },
  };
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, ...rest } = useAuthLogin({
    mutation: {
      onSuccess: (res: authLoginResponse) => {
        setSessionFromUser(queryClient, res.data.user);
      },
    },
  });

  return {
    ...rest,
    mutate: (
      variables: LoginVariables,
      options?: Parameters<typeof mutate>[1],
    ) => mutate(toLoginBody(variables), options),
    mutateAsync: (
      variables: LoginVariables,
      options?: Parameters<typeof mutateAsync>[1],
    ) => mutateAsync(toLoginBody(variables), options),
  };
}

type RegisterVariables = { role: UserRole; values: RegisterFormValues };

function toRegisterBody(variables: RegisterVariables) {
  return {
    data: {
      fullName: variables.values.fullName,
      email: variables.values.email,
      password: variables.values.password,
      role: variables.role,
    },
  };
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, ...rest } = useAuthRegister({
    mutation: {
      onSuccess: (res: authRegisterResponse) => {
        setSessionFromUser(queryClient, res.data.user);
      },
    },
  });

  return {
    ...rest,
    mutate: (
      variables: RegisterVariables,
      options?: Parameters<typeof mutate>[1],
    ) => mutate(toRegisterBody(variables), options),
    mutateAsync: (
      variables: RegisterVariables,
      options?: Parameters<typeof mutateAsync>[1],
    ) => mutateAsync(toRegisterBody(variables), options),
  };
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useAuthLogout({
    mutation: {
      onSettled: () => {
        clearSessionCache(queryClient);
      },
    },
  });
}
