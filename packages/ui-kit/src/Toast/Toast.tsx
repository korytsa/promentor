import {
  Alert,
  AlertTitle,
  Snackbar,
  type AlertColor,
  type AlertProps,
  type SnackbarProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { ReactNode } from "react";

export interface ToastProps extends Omit<
  SnackbarProps,
  "open" | "onClose" | "message" | "children" | "title"
> {
  open?: boolean;
  tone?: AlertColor;
  title?: ReactNode;
  message?: ReactNode;
  autoHideDuration?: number | null;
  onClose?: () => void;
  alertVariant?: AlertProps["variant"];
  alertSx?: SxProps<Theme>;
}

export const Toast = ({
  open = false,
  tone = "info",
  title,
  message,
  onClose,
  autoHideDuration = 4000,
  anchorOrigin = { vertical: "top", horizontal: "right" },
  alertVariant = "filled",
  alertSx,
  ...props
}: ToastProps) => {
  const handleClose = () => onClose?.();

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={autoHideDuration}
      anchorOrigin={anchorOrigin}
      {...props}
    >
      <Alert
        onClose={handleClose}
        severity={tone}
        variant={alertVariant}
        sx={{
          borderRadius: 2,
          minWidth: 320,
          maxWidth: 420,
          alignItems: "flex-start",
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.18)",
          "& .MuiAlert-message": { py: 0.25 },
          ...alertSx,
        }}
      >
        {title ? (
          <AlertTitle sx={{ mb: 0.5, fontWeight: 700 }}>{title}</AlertTitle>
        ) : null}
        {message}
      </Alert>
    </Snackbar>
  );
};
