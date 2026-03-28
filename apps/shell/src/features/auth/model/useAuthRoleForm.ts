import {
  useForm,
  type FieldValues,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";
import type { UserRole } from "@/entities/user/types";
import { getErrorMessage } from "@/shared/api";

type AuthRoleMutation<TValues extends FieldValues> = {
  error: unknown;
  isError: boolean;
  isPending: boolean;
  mutate: (payload: { role: UserRole; values: TValues }) => void;
};

export type UseAuthRoleFormParams<TValues extends FieldValues> = {
  role: UserRole;
  mutation: AuthRoleMutation<TValues>;
  fallbackErrorMessage: string;
} & UseFormProps<TValues>;

export function useAuthRoleForm<TValues extends FieldValues>({
  role,
  mutation,
  fallbackErrorMessage,
  ...formOptions
}: UseAuthRoleFormParams<TValues>) {
  const { register, handleSubmit, formState } = useForm<TValues>(formOptions);
  const { error, isError, isPending, mutate } = mutation;

  const submitHandler: SubmitHandler<TValues> = (values) => {
    mutate({ role, values });
  };

  const serverError = isError && getErrorMessage(error, fallbackErrorMessage);

  return {
    register,
    handleSubmit,
    errors: formState.errors,
    submitHandler,
    serverError,
    isPending,
  };
}
