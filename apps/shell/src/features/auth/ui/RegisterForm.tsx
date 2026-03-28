import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@promentorapp/ui-kit";
import type { UserRole } from "@/entities/user/types";
import { useRegisterMutation } from "../api";
import { useAuthRoleForm } from "../model/useAuthRoleForm";
import { registerSchema } from "../model/schema";
import { AuthFormOAuthDivider } from "./AuthFormOAuthDivider";
import { AuthFormServerError } from "./AuthFormServerError";
import { FormField } from "./FormField";

export const RegisterForm = ({ role }: { role: UserRole }) => {
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
      <AuthFormServerError message={serverError} />
      <AuthFormOAuthDivider googleLabel="Sign up with Google" />
      <FormField
        label="Full Name"
        type="text"
        autoComplete="name"
        placeholder="John Doe"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="john@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <FormField
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
          customVariant="authPrimary"
          fullWidth={true}
          disabled={isPending}
        >
          Create Account
        </Button>
      </div>
    </form>
  );
};
