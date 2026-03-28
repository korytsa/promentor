import {
  forwardRef,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
} from "react";
import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  type ButtonProps as MuiButtonProps,
  type IconButtonProps as MuiIconButtonProps,
  styled,
} from "@mui/material";

export type ButtonCustomVariant =
  | "ghost"
  | "glass"
  | "plain"
  | "menuTrigger"
  | "menuItemDanger"
  | "authPrimary"
  | "authGlass";

export type PromentorButtonProps =
  | (Omit<MuiButtonProps, "variant" | "color"> & {
      isIconOnly?: false;
      children?: ReactNode;
      customVariant?: ButtonCustomVariant;
      variant?: MuiButtonProps["variant"];
      color?: MuiButtonProps["color"];
    })
  | (Omit<MuiIconButtonProps, "color" | "aria-label"> & {
      isIconOnly: true;
      children?: ReactNode;
      customVariant?: ButtonCustomVariant;
      variant?: never;
      color?: MuiIconButtonProps["color"];
      "aria-label": string;
    });

const StyledIconButton = styled(MuiIconButton, {
  shouldForwardProp: (prop) => prop !== "customVariant",
})<{ customVariant?: ButtonCustomVariant }>(({ customVariant, theme }) => ({
  ...(customVariant === "ghost" && {
    color:
      theme.palette.mode === "dark"
        ? "rgba(148, 163, 184, 1)"
        : "rgba(71, 85, 105, 1)",
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(15, 23, 42, 0.06)",
    },
  }),
  ...(customVariant === "glass" && {
    color: "var(--pm-text-primary)",
    backgroundColor: "var(--pm-surface)",
    border: "1px solid var(--pm-border)",
    borderRadius: "12px",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "var(--pm-surface-overlay)",
    },
    padding: "8px",
  }),
  ...(customVariant === "plain" && {
    padding: 0,
    minWidth: 0,
    backgroundColor: "transparent",
    color: "inherit",
    "&:hover": {
      backgroundColor: "transparent",
    },
  }),
}));

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== "customVariant",
})<{ customVariant?: ButtonCustomVariant }>(({ customVariant, theme }) => ({
  ...(customVariant === "ghost" && {
    color:
      theme.palette.mode === "dark"
        ? "rgba(148, 163, 184, 1)"
        : "rgba(71, 85, 105, 1)",
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(15, 23, 42, 0.06)",
    },
    borderRadius: "8px",
  }),
  ...(customVariant === "glass" && {
    color: "var(--pm-text-primary)",
    backgroundColor: "var(--pm-surface)",
    border: "1px solid var(--pm-border)",
    borderRadius: "12px",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "var(--pm-surface-overlay)",
    },
  }),
  ...(customVariant === "authPrimary" && {
    height: "48px",
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 900,
    letterSpacing: "0.03em",
    color: "#0f172a",
    backgroundImage: "linear-gradient(to right, #22d3ee, #3b82f6)",
    boxShadow: "0 16px 40px rgba(56, 189, 248, 0.34)",
    "&:hover": {
      backgroundImage: "linear-gradient(to right, #67e8f9, #60a5fa)",
    },
  }),
  ...(customVariant === "authGlass" && {
    height: "48px",
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 600,
    color: "var(--pm-text-secondary)",
    border: "1px solid var(--pm-border)",
    backgroundColor: "var(--pm-surface)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    "&:hover": {
      backgroundColor: "var(--pm-surface-hover)",
      border: "1px solid var(--pm-border)",
    },
  }),
  ...(customVariant === "plain" && {
    padding: 0,
    minWidth: 0,
    backgroundColor: "transparent",
    color: "inherit",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "transparent",
    },
  }),
  ...(customVariant === "menuTrigger" && {
    padding: 0,
    minWidth: 0,
    backgroundColor: "transparent",
    color: "inherit",
    textTransform: "none",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    "&:hover": {
      backgroundColor: "transparent",
    },
    "&:hover .user-menu-trigger-title": {
      color: "var(--pm-text-primary)",
    },
  }),
  ...(customVariant === "menuItemDanger" && {
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
    transition: "all 200ms ease",
    backgroundColor: "transparent",
    color: "#fb7185",
    "&:hover": {
      backgroundColor: "rgba(244, 63, 94, 0.1)",
      color: "#fda4af",
    },
  }),
}));

const ButtonBase = forwardRef<HTMLButtonElement, PromentorButtonProps>(
  (props, ref) => {
    if (props.isIconOnly) {
      const { customVariant, children, ...rest } = props;
      return (
        <StyledIconButton ref={ref} customVariant={customVariant} {...rest}>
          {children}
        </StyledIconButton>
      );
    }

    const { customVariant, variant, children, ...rest } = props;
    return (
      <StyledButton
        ref={ref}
        variant={variant}
        customVariant={customVariant}
        {...rest}
      >
        {children}
      </StyledButton>
    );
  },
);

ButtonBase.displayName = "ButtonBase";

export const Button: ForwardRefExoticComponent<
  PromentorButtonProps & RefAttributes<HTMLButtonElement>
> = ButtonBase;

Button.displayName = "Button";
