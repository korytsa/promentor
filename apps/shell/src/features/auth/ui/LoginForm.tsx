import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@promentorapp/ui-kit";
import type { UserRole } from "@/entities/user/types";
import { AUTH_APP_HOME_PATH } from "@/entities/user/model/constants";
import { useLoginMutation } from "../api";
import { useAuthRoleForm } from "../model/useAuthRoleForm";
import { loginSchema } from "../model/schema";
import { AuthFormOAuthDivider } from "./AuthFormOAuthDivider";
import { AuthFormServerError } from "./AuthFormServerError";
import { FormField } from "./FormField";

export const LoginForm = ({ role }: { role: UserRole }) => {
  const navigate = useNavigate();
  const mutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    errors,
    submitHandler,
    serverError,
    isPending,
  } = useAuthRoleForm({
    role,
    mutation,
    onAuthenticated: () => {
      navigate(AUTH_APP_HOME_PATH, { replace: true });
    },
    fallbackErrorMessage: "Sign in failed",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <AuthFormServerError message={serverError} />
      <AuthFormOAuthDivider googleLabel="Sign in with Google" />
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
