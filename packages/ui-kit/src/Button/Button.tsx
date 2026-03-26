import { forwardRef, type ReactNode } from "react";
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
  | "menuItemDanger";

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
})<{ customVariant?: ButtonCustomVariant }>(({ customVariant }) => ({
  ...(customVariant === "ghost" && {
    color: "rgba(148, 163, 184, 1)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
  }),
  ...(customVariant === "glass" && {
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
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
})<{ customVariant?: ButtonCustomVariant }>(({ customVariant }) => ({
  ...(customVariant === "ghost" && {
    color: "rgba(148, 163, 184, 1)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    borderRadius: "8px",
  }),
  ...(customVariant === "glass" && {
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
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
      color: "#fff",
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

export const Button = forwardRef<HTMLButtonElement, PromentorButtonProps>(
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

Button.displayName = "Button";
