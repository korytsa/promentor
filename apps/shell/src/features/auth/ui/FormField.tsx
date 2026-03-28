import { InputHTMLAttributes } from "react";
import { Typography } from "@promentorapp/ui-kit";
import { cn } from "@/shared/lib/utils";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = ({
  label,
  error,
  className,
  ...props
}: FormFieldProps) => {
  return (
    <label className="flex flex-col gap-2">
      <Typography variantStyle="label">{label}</Typography>
      <input
        className={cn(
          "auth-form-input h-12 rounded-xl border px-4 text-slate-100 placeholder:text-slate-500 outline-none transition-all",
          error
            ? "border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/30"
            : "border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25",
          className,
        )}
        {...props}
      />
      {error ? <Typography variantStyle="error">{error}</Typography> : null}
    </label>
  );
};
