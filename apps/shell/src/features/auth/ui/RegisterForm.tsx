import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from "@promentorapp/ui-kit";
import type { UserRole } from "@/entities/user/types";
import { AUTH_APP_HOME_PATH } from "@/entities/user/model/constants";
import { useRegisterMutation } from "../api";
import { startGoogleAuth } from "../model/googleAuth";
import { useAuthRoleForm } from "../model/useAuthRoleForm";
import { registerSchema } from "../model/schema";
import { useOauthFailedSearchParam } from "../model/useOauthFailedSearchParam";
import { AuthFormOAuthDivider } from "./AuthFormOAuthDivider";
import { AuthFormServerError } from "./AuthFormServerError";

export const RegisterForm = ({ role }: { role: UserRole }) => {
  const oauthFailedMessage = useOauthFailedSearchParam();
  const navigate = useNavigate();
  const mutation = useRegisterMutation();
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
    fallbackErrorMessage: "Registration failed",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <AuthFormServerError message={oauthFailedMessage ?? serverError} />
      <AuthFormOAuthDivider
        googleLabel="Sign up with Google"
        onGoogleClick={() => {
          startGoogleAuth({ role, mode: "register" });
        }}
        disabled={isPending}
      />
      <TextField
        label="Full Name"
        type="text"
        autoComplete="name"
        placeholder="John Doe"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="john@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 chars, 1 uppercase, 1 number"
        error={errors.password?.message}
        {...register("password")}
      />
      <div className="mt-3">
        <Button
          type="submit"
          customVariant="hero"
          fullWidth={true}
          disabled={isPending}
        >
          Create Account
        </Button>
      </div>
    </form>
  );
};
