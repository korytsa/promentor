import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  type DialogProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { ReactNode } from "react";
import { Typography } from "../Typography";

export interface ModalProps extends Omit<
  DialogProps,
  "onClose" | "open" | "title"
> {
  open?: boolean;
  title?: ReactNode;
  text?: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
  contentSx?: SxProps<Theme>;
}

export const Modal = ({
  open = false,
  onClose,
  title,
  text,
  footer,
  children,
  maxWidth = "xs",
  fullWidth = true,
  showCloseButton = true,
  contentSx,
  ...props
}: ModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={() => onClose?.()}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(2, 6, 23, 0.55)",
            backdropFilter: "blur(8px)",
          },
        },
        paper: {
          sx: {
            borderRadius: 2,
            border: "1px solid rgba(148, 163, 184, 0.24)",
            boxShadow: "0 24px 48px rgba(15, 23, 42, 0.2)",
            overflow: "hidden",
            width: "min(100%, 460px)",
          },
        },
      }}
      {...props}
    >
      {(title || showCloseButton) && (
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box
            display="flex"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={2}
          >
            <Box minWidth={0}>
              {title && (
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ lineHeight: 1.2 }}
                >
                  {title}
                </Typography>
              )}
            </Box>
            {showCloseButton && (
              <IconButton
                aria-label="Close modal"
                onClick={() => onClose?.()}
                size="medium"
                sx={{ mt: -0.5, mr: -0.5, color: "text.secondary" }}
              >
                <span
                  aria-hidden
                  style={{
                    fontSize: 22,
                    lineHeight: 1,
                    fontWeight: 500,
                    display: "block",
                  }}
                >
                  ×
                </span>
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}

      <DialogContent sx={{ px: 3, pb: 3, pt: title ? 0.5 : 3, ...contentSx }}>
        {text ? (
          <Typography variant="body2" color="text.secondary">
            {text}
          </Typography>
        ) : null}
        {children}
      </DialogContent>

      {footer && (
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0.5, gap: 1.5 }}>
          {footer}
        </DialogActions>
      )}
    </Dialog>
  );
};
