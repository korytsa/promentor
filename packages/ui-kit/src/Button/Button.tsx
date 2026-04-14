import {
  forwardRef,
  useMemo,
  useState,
  type CSSProperties,
  type ButtonHTMLAttributes,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
} from "react";
import { useAppTheme } from "../Theme";

export type ButtonCustomVariant =
  | "surface"
  | "ghost"
  | "menuTrigger"
  | "menuItemDanger"
  | "hero";

type ButtonVariant = "text" | "outlined" | "contained";
type ButtonColor =
  | "inherit"
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "info"
  | "warning";

type ButtonSx = CSSProperties & {
  "&:hover"?: CSSProperties;
};

export type PromentorButtonProps =
  | (Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
      isIconOnly?: false;
      children?: ReactNode;
      customVariant?: ButtonCustomVariant;
      variant?: ButtonVariant;
      color?: ButtonColor;
      sx?: ButtonSx;
      fullWidth?: boolean;
    })
  | (Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
      isIconOnly: true;
      children?: ReactNode;
      customVariant?: ButtonCustomVariant;
      variant?: ButtonVariant;
      color?: ButtonColor;
      sx?: ButtonSx;
      fullWidth?: boolean;
      "aria-label": string;
    });

type ThemeMode = "light" | "dark";

type ComputedButtonStyles = {
  base: CSSProperties;
  hover?: CSSProperties;
};

type ButtonPalette = {
  main: string;
  hover: string;
  text: string;
  soft: string;
};

const BUTTON_TRANSITION = "all 0.2s ease";

const createStyles = (
  base: CSSProperties,
  hover?: CSSProperties,
): ComputedButtonStyles => ({
  base,
  hover,
});

const createGhostStyles = ({
  textColor,
  hoverColor,
  hoverBackground,
  radius = "10px",
  fontWeight = 600,
}: {
  textColor: string;
  hoverColor?: string;
  hoverBackground: string;
  radius?: string;
  fontWeight?: number;
}): ComputedButtonStyles =>
  createStyles(
    {
      color: textColor,
      backgroundColor: "transparent",
      border: "1px solid transparent",
      borderRadius: radius,
      fontWeight,
      textTransform: "none",
    },
    {
      color: hoverColor ?? textColor,
      backgroundColor: hoverBackground,
    },
  );

const getPaletteMap = (mode: ThemeMode): Record<ButtonColor, ButtonPalette> => {
  const isDark = mode === "dark";
  return {
    primary: {
      main: isDark ? "#60a5fa" : "#2563eb",
      hover: isDark ? "#93c5fd" : "#1d4ed8",
      text: isDark ? "#dbeafe" : "#1d4ed8",
      soft: isDark ? "rgba(96, 165, 250, 0.14)" : "rgba(37, 99, 235, 0.08)",
    },
    error: {
      main: isDark ? "#fb7185" : "#e11d48",
      hover: isDark ? "#fda4af" : "#be123c",
      text: isDark ? "#fecdd3" : "#be123c",
      soft: isDark ? "rgba(251, 113, 133, 0.18)" : "rgba(225, 29, 72, 0.08)",
    },
    secondary: {
      main: isDark ? "#94a3b8" : "#64748b",
      hover: isDark ? "#cbd5e1" : "#475569",
      text: isDark ? "#e2e8f0" : "#334155",
      soft: isDark ? "rgba(148, 163, 184, 0.16)" : "rgba(100, 116, 139, 0.08)",
    },
    success: {
      main: isDark ? "#4ade80" : "#16a34a",
      hover: isDark ? "#86efac" : "#15803d",
      text: isDark ? "#bbf7d0" : "#166534",
      soft: isDark ? "rgba(74, 222, 128, 0.16)" : "rgba(22, 163, 74, 0.1)",
    },
    info: {
      main: isDark ? "#38bdf8" : "#0284c7",
      hover: isDark ? "#7dd3fc" : "#0369a1",
      text: isDark ? "#bae6fd" : "#0c4a6e",
      soft: isDark ? "rgba(56, 189, 248, 0.16)" : "rgba(2, 132, 199, 0.1)",
    },
    warning: {
      main: isDark ? "#fbbf24" : "#d97706",
      hover: isDark ? "#fcd34d" : "#b45309",
      text: isDark ? "#fde68a" : "#92400e",
      soft: isDark ? "rgba(251, 191, 36, 0.16)" : "rgba(217, 119, 6, 0.1)",
    },
    inherit: {
      main: "currentColor",
      hover: "currentColor",
      text: "currentColor",
      soft: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)",
    },
  };
};

const getDefaultVariantStyles = (
  variant: ButtonVariant | undefined,
  color: ButtonColor | undefined,
  mode: ThemeMode,
): ComputedButtonStyles => {
  const resolvedVariant = variant ?? "text";
  const resolvedColor = color ?? "primary";
  const palette = getPaletteMap(mode)[resolvedColor];

  if (resolvedVariant === "contained") {
    return createStyles(
      {
        color:
          resolvedColor === "inherit" ? "var(--pm-text-primary)" : "#ffffff",
        backgroundColor: palette.main,
        border: "1px solid transparent",
        borderRadius: "10px",
        padding: "8px 14px",
        fontWeight: 600,
        textTransform: "none",
      },
      { backgroundColor: palette.hover },
    );
  }

  if (resolvedVariant === "outlined") {
    return createStyles(
      {
        color: palette.text,
        backgroundColor: "transparent",
        border: `1px solid ${palette.main}`,
        borderRadius: "10px",
        padding: "8px 14px",
        fontWeight: 600,
        textTransform: "none",
      },
      { backgroundColor: palette.soft },
    );
  }

  return createStyles(
    {
      color: palette.text,
      backgroundColor: "transparent",
      border: "1px solid transparent",
      borderRadius: "10px",
      padding: "8px 14px",
      fontWeight: 600,
      textTransform: "none",
    },
    { backgroundColor: palette.soft },
  );
};

const getButtonVariantStyles = (
  customVariant: ButtonCustomVariant | undefined,
  mode: ThemeMode,
): ComputedButtonStyles => {
  const isDark = mode === "dark";
  if (!customVariant) {
    return { base: {} };
  }

  const tokens = {
    ghostText: isDark ? "rgba(148, 163, 184, 1)" : "rgba(71, 85, 105, 1)",
    ghostHover: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.06)",
  };

  switch (customVariant) {
    case "surface":
      return createStyles(
        {
          color: "var(--pm-text-primary)",
          backgroundColor: "var(--pm-surface)",
          border: "1px solid var(--pm-border)",
          borderRadius: "12px",
          textTransform: "none",
        },
        {
          backgroundColor: "var(--pm-surface-overlay)",
        },
      );
    case "ghost":
      return createGhostStyles({
        textColor: tokens.ghostText,
        hoverBackground: tokens.ghostHover,
        radius: "8px",
      });
    case "menuTrigger":
      return createStyles(
        {
          padding: 0,
          minWidth: 0,
          backgroundColor: "transparent",
          color: "inherit",
          textTransform: "none",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        },
        { backgroundColor: "transparent" },
      );
    case "menuItemDanger":
      return createStyles(
        {
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "12px",
          padding: "10px 12px",
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 700,
          fontSize: "14px",
          backgroundColor: "transparent",
          color: "#fb7185",
        },
        {
          backgroundColor: "rgba(244, 63, 94, 0.1)",
          color: "#fda4af",
        },
      );
    case "hero":
      return createStyles(
        {
          height: "48px",
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 900,
          letterSpacing: "0.03em",
          color: "#0f172a",
          backgroundImage: "linear-gradient(to right, #22d3ee, #3b82f6)",
          boxShadow: "0 16px 40px rgba(56, 189, 248, 0.34)",
          border: "1px solid transparent",
        },
        { backgroundImage: "linear-gradient(to right, #67e8f9, #60a5fa)" },
      );
    default:
      return { base: {} };
  }
};

const splitSx = (sx?: ButtonSx): ComputedButtonStyles => {
  if (!sx) {
    return { base: {} };
  }

  const hover = sx["&:hover"];
  const base = { ...sx };
  delete base["&:hover"];
  return { base, hover };
};

const ButtonBase = forwardRef<HTMLButtonElement, PromentorButtonProps>(
  (props, ref) => {
    const { mode } = useAppTheme();
    const [isHovered, setIsHovered] = useState(false);

    const {
      customVariant,
      variant,
      color,
      children,
      isIconOnly,
      fullWidth,
      sx,
      style,
      disabled,
      type,
      ...rest
    } = props;

    const defaultStyles = useMemo(
      () => getDefaultVariantStyles(variant, color, mode),
      [variant, color, mode],
    );
    const customStyles = useMemo(
      () => getButtonVariantStyles(customVariant, mode),
      [customVariant, mode],
    );
    const sxStyles = useMemo(() => splitSx(sx), [sx]);

    const baseStyle: CSSProperties = {
      fontFamily: "inherit",
      fontSize: "14px",
      lineHeight: 1.2,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      userSelect: "none",
      transition: BUTTON_TRANSITION,
      textDecoration: "none",
      width: fullWidth ? "100%" : undefined,
      minWidth: isIconOnly ? 0 : undefined,
      padding: isIconOnly ? "8px" : undefined,
      outline: "none",
      ...defaultStyles.base,
      ...customStyles.base,
      ...sxStyles.base,
      ...style,
    };

    const hoverStyle: CSSProperties = !disabled
      ? {
          ...defaultStyles.hover,
          ...customStyles.hover,
          ...sxStyles.hover,
        }
      : {};

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={disabled}
        style={isHovered ? { ...baseStyle, ...hoverStyle } : baseStyle}
        onMouseEnter={(event) => {
          setIsHovered(true);
          props.onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          setIsHovered(false);
          props.onMouseLeave?.(event);
        }}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

ButtonBase.displayName = "ButtonBase";

export const Button: ForwardRefExoticComponent<
  PromentorButtonProps & RefAttributes<HTMLButtonElement>
> = ButtonBase;

Button.displayName = "Button";
