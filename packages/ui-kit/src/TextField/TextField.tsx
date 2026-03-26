import {
  TextField as MuiTextField,
  type TextFieldProps as MuiTextFieldProps,
} from "@mui/material";
import { forwardRef } from "react";
import { fieldControlSx } from "../Theme/fieldControlSx";

export type TextFieldProps = Omit<MuiTextFieldProps, "variant"> & {
  errorMessage?: string;
  variant?: MuiTextFieldProps["variant"];
};

export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  function TextField(
    { errorMessage, error, helperText, sx, variant = "outlined", ...props },
    ref,
  ) {
    const hasError = Boolean(errorMessage) || Boolean(error);
    const helper =
      errorMessage !== undefined && errorMessage !== ""
        ? errorMessage
        : helperText;

    return (
      <MuiTextField
        ref={ref}
        variant={variant}
        error={hasError}
        helperText={helper}
        sx={
          Array.isArray(sx)
            ? [fieldControlSx, ...sx]
            : sx
              ? [fieldControlSx, sx]
              : fieldControlSx
        }
        {...props}
      />
    );
  },
);
