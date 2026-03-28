import {
  useForm,
  type FieldValues,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";
import type { UserRole } from "@/entities/user/types";
import { getErrorMessage } from "@/shared/api";

export type AuthRoleMutation<TValues extends FieldValues> = {
  error: unknown;
  isError: boolean;
  isPending: boolean;
  mutate: (
    payload: { role: UserRole; values: TValues },
    options?: {
      onSuccess?: () => void;
    },
  ) => void;
  mutateAsync: (payload: {
    role: UserRole;
    values: TValues;
  }) => Promise<unknown>;
};

export type UseAuthRoleFormParams<TValues extends FieldValues> = {
  role: UserRole;
  mutation: AuthRoleMutation<TValues>;
  fallbackErrorMessage: string;
  onAuthenticated?: () => void;
} & UseFormProps<TValues>;

export function useAuthRoleForm<TValues extends FieldValues>({
  role,
  mutation,
  fallbackErrorMessage,
  onAuthenticated,
  ...formOptions
}: UseAuthRoleFormParams<TValues>) {
  const { register, handleSubmit, formState } = useForm<TValues>(formOptions);
  const { error, isError, isPending, mutate, mutateAsync } = mutation;

  const submitHandler: SubmitHandler<TValues> = (values) => {
    if (onAuthenticated) {
      void mutateAsync({ role, values })
        .then(() => {
          onAuthenticated();
        })
        .catch(() => {
          /* error state comes from mutation.isError / serverError */
        });
      return;
    }
    mutate({ role, values });
  };

  const serverError = isError
    ? getErrorMessage(error, fallbackErrorMessage)
    : undefined;

  return {
    register,
    handleSubmit,
    errors: formState.errors,
    submitHandler,
    serverError,
    isPending,
  };
}
