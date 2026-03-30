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
      <Typography variantStyle="label" className="pm-text-secondary">
        {label}
      </Typography>
      <input
        className={cn(
          "auth-form-input h-12 rounded-xl border px-4 bg-[var(--pm-surface)] pm-text-primary placeholder:pm-text-muted outline-none transition-all",
          error
            ? "border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/30"
            : "pm-border focus:border-[var(--pm-accent-cyan)] focus:ring-2 focus:ring-cyan-500/25",
          className,
        )}
        {...props}
      />
      {error ? (
        <Typography variantStyle="error" className="text-rose-500">
          {error}
        </Typography>
      ) : null}
    </label>
  );
};
