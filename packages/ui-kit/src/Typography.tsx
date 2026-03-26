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
  title: "text-slate-100 font-black",
  subtitle: "text-slate-200 font-semibold",
  body: "text-slate-200",
  label: "text-sm font-semibold text-slate-200/95",
  caption: "text-xs text-slate-400",
  muted: "text-slate-400",
  error: "text-xs text-rose-400",
  eyebrow: "text-xs uppercase tracking-[0.26em] text-cyan-300 font-semibold",
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
