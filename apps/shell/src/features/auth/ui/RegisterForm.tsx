import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@promentorapp/ui-kit";
import { RegisterFormValues, registerSchema } from "../model/schema";
import { FormField } from "./FormField";
import { GoogleAuthButton } from "./GoogleAuthButton";

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => void;
  onGoogleRegister?: () => void;
}

export const RegisterForm = ({
  onSubmit,
  onGoogleRegister,
}: RegisterFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const submitHandler: SubmitHandler<RegisterFormValues> = (values) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <GoogleAuthButton
        onClick={() => onGoogleRegister?.()}
        label="Sign up with Google"
      />
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px bg-white/10 flex-1" />
        OR
        <span className="h-px bg-white/10 flex-1" />
      </div>
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
        <Button type="submit" customVariant="authPrimary" fullWidth={true}>
          Create Account
        </Button>
      </div>
    </form>
  );
};
