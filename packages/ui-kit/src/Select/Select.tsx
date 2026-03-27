import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  type SelectProps as MuiSelectProps,
} from "@mui/material";
import { forwardRef, useId } from "react";
import { fieldControlSx } from "../Theme/fieldControlSx";

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
    inputProps,
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
  const computedAriaLabel =
    inputProps?.["aria-label"] ??
    (label ? undefined : placeholder ? String(placeholder) : "Select option");

  return (
    <FormControl
      fullWidth={fullWidth}
      error={hasError}
      sx={
        Array.isArray(sx)
          ? [fieldControlSx, ...sx]
          : sx
            ? [fieldControlSx, sx]
            : fieldControlSx
      }
    >
      {label ? <InputLabel id={selectLabelId}>{label}</InputLabel> : null}
      <MuiSelect
        ref={ref}
        id={selectId}
        labelId={label ? selectLabelId : undefined}
        label={label}
        displayEmpty={displayEmpty || shouldShowPlaceholder}
        inputProps={{
          ...inputProps,
          ...(computedAriaLabel ? { "aria-label": computedAriaLabel } : {}),
        }}
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
