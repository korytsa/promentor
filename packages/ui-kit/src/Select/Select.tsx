import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  type SelectProps as MuiSelectProps,
} from "@mui/material";
import { forwardRef, useId } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export type SelectProps = Omit<MuiSelectProps, "variant" | "error"> & {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
};

const controlSx = {
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

export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(
  {
    label,
    error,
    errorMessage,
    helperText,
    options = [],
    placeholder,
    displayEmpty,
    fullWidth = true,
    sx,
    id,
    labelId,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? `pm-select-${generatedId}`;
  const selectLabelId = labelId ?? `${selectId}-label`;
  const hasError = Boolean(errorMessage) || Boolean(error);
  const helper =
    errorMessage !== undefined && errorMessage !== ""
      ? errorMessage
      : helperText;
  const shouldShowPlaceholder = Boolean(placeholder) && !label;

  return (
    <FormControl
      fullWidth={fullWidth}
      error={hasError}
      sx={
        Array.isArray(sx)
          ? [controlSx, ...sx]
          : sx
            ? [controlSx, sx]
            : controlSx
      }
    >
      {label ? <InputLabel id={selectLabelId}>{label}</InputLabel> : null}
      <MuiSelect
        ref={ref}
        id={selectId}
        labelId={label ? selectLabelId : undefined}
        label={label}
        displayEmpty={displayEmpty || shouldShowPlaceholder}
        {...props}
      >
        {shouldShowPlaceholder ? (
          <MenuItem disabled value="">
            {placeholder}
          </MenuItem>
        ) : null}
        {children ??
          options.map((option) => (
            <MenuItem
              key={String(option.value)}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
      </MuiSelect>
      {helper ? <FormHelperText>{helper}</FormHelperText> : null}
    </FormControl>
  );
});
