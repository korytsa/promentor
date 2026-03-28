import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@promentorapp/ui-kit";
import { LoginFormValues, loginSchema } from "../model/schema";
import { FormField } from "./FormField";
import { GoogleAuthButton } from "./GoogleAuthButton";

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  onGoogleLogin?: () => void;
}

export const LoginForm = ({ onSubmit, onGoogleLogin }: LoginFormProps) => {
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
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <GoogleAuthButton
        onClick={() => onGoogleLogin?.()}
        label="Sign in with Google"
      />
      <div className="flex items-center gap-3 text-xs pm-text-muted">
        <span className="h-px flex-1 bg-[var(--pm-divider)]" />
        OR
        <span className="h-px flex-1 bg-[var(--pm-divider)]" />
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
        <Button type="submit" customVariant="authPrimary" fullWidth={true}>
          Sign In
        </Button>
      </div>
    </form>
  );
};
