import {
  TextField as MuiTextField,
  type TextFieldProps as MuiTextFieldProps,
} from "@mui/material";
import { forwardRef } from "react";

export type TextFieldProps = Omit<MuiTextFieldProps, "variant"> & {
  errorMessage?: string;
  variant?: MuiTextFieldProps["variant"];
};

const fieldSx: MuiTextFieldProps["sx"] = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "primary.light",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderWidth: 2,
    },
    "&.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderColor: "error.main",
    },
  },
  "& .MuiInputLabel-outlined": {
    "&.Mui-focused": {
      color: "primary.main",
    },
  },
  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    marginTop: 0.75,
    fontSize: "0.8125rem",
    lineHeight: 1.35,
  },
  "& .MuiFormHelperText-root.Mui-error": {
    color: "error.main",
  },
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
        sx={Array.isArray(sx) ? [fieldSx, ...sx] : sx ? [fieldSx, sx] : fieldSx}
        {...props}
      />
    );
  },
);
