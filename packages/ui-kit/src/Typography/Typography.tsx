import {
  Typography as MuiTypography,
  type TypographyProps as MuiTypographyProps,
} from "@mui/material";

export type TypographyVariantStyle =
  | "title"
  | "subtitle"
  | "body"
  | "label"
  | "caption"
  | "muted"
  | "error"
  | "eyebrow";

export interface PromentorTypographyProps extends MuiTypographyProps {
  variantStyle?: TypographyVariantStyle;
}

const variantStyleClasses: Record<TypographyVariantStyle, string> = {
  title: "font-black pm-text-primary",
  subtitle: "font-semibold pm-text-secondary",
  body: "pm-text-secondary",
  label: "text-sm font-semibold pm-text-secondary",
  caption: "text-xs pm-text-muted",
  muted: "pm-text-muted",
  error: "text-xs text-rose-400",
  eyebrow: "font-semibold uppercase tracking-wide text-[var(--pm-accent-cyan)]",
};

const withClasses = (...values: Array<string | undefined>) =>
  values.filter(Boolean).join(" ");

export const Typography = ({
  variantStyle = "body",
  className,
  children,
  ...props
}: PromentorTypographyProps) => {
  return (
    <MuiTypography
      className={withClasses(variantStyleClasses[variantStyle], className)}
      {...props}
    >
      {children}
    </MuiTypography>
  );
};
