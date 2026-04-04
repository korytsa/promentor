import { InputHTMLAttributes } from "react";
import { Typography } from "../Typography";

export type TextFieldSize = "sm" | "md" | "lg";

const TEXT_FIELD_SIZE_STYLES: Record<TextFieldSize, string> = {
  sm: "h-12 rounded-lg px-3 text-sm",
  md: "h-14 rounded-xl px-4 text-base",
  lg: "h-16 rounded-2xl px-4 text-base",
};

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label: string;
  error?: string;
  size?: TextFieldSize;
}

export const TextField = ({
  label,
  error,
  size = "sm",
  className,
  ...props
}: TextFieldProps) => {
  return (
    <label className="flex flex-col gap-2">
      <Typography variantStyle="label" className="pm-text-secondary">
        {label}
      </Typography>
      <input
        className={[
          "border bg-[var(--pm-surface)] pm-text-primary placeholder:pm-text-muted outline-none transition-all",
          TEXT_FIELD_SIZE_STYLES[size],
          error
            ? "border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/30"
            : "pm-border focus:border-[var(--pm-accent-cyan)] focus:ring-2 focus:ring-cyan-500/25",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
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
