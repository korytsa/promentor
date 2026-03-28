import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button, Typography } from "@promentorapp/ui-kit";
import type { UserRole } from "@/entities/user/types";
import { getErrorMessage } from "@/shared/api";
import { useLoginMutation } from "../api";
import { LoginFormValues, loginSchema } from "../model/schema";
import { FormField } from "./FormField";
import { GoogleAuthButton } from "./GoogleAuthButton";

interface LoginFormProps {
  role: UserRole;
}

export const LoginForm = ({ role }: LoginFormProps) => {
  const { error, isError, isPending, mutate } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitHandler: SubmitHandler<LoginFormValues> = (values) => {
    mutate({ values, role });
  };

  const serverError = isError && getErrorMessage(error, "Sign in failed");

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      {serverError ? (
        <Typography
          component="p"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        >
          {serverError}
        </Typography>
      ) : null}
      <GoogleAuthButton label="Sign in with Google" />
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px bg-white/10 flex-1" />
        OR
        <span className="h-px bg-white/10 flex-1" />
      </div>
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="mentor@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="mt-3">
        <Button
          type="submit"
          customVariant="authPrimary"
          fullWidth={true}
          disabled={isPending}
        >
          Sign In
        </Button>
      </div>
    </form>
  );
};
