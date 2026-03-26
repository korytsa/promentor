import {
  Box,
  FormControlLabel,
  FormHelperText,
  Switch as MuiSwitch,
  type FormControlLabelProps,
  type SwitchProps as MuiSwitchProps,
  styled,
} from "@mui/material";
import type { ReactNode } from "react";

export interface SwitchProps extends Omit<MuiSwitchProps, "color"> {
  label?: ReactNode;
  helperText?: ReactNode;
  errorMessage?: ReactNode;
  color?: MuiSwitchProps["color"];
  labelPlacement?: FormControlLabelProps["labelPlacement"];
}

const StyledSwitch = styled(MuiSwitch)(({ theme }) => ({
  width: 46,
  height: 28,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(18px)",
      "& + .MuiSwitch-track": {
        opacity: 1,
      },
      "& .MuiSwitch-thumb": {
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.25)",
      },
    },
    "&.Mui-disabled": {
      color: "#94a3b8",
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 1,
      backgroundColor: theme.palette.mode === "light" ? "#e2e8f0" : "#334155",
    },
    "&.Mui-checked.Mui-disabled + .MuiSwitch-track": {
      backgroundColor: theme.palette.mode === "light" ? "#94a3b8" : "#64748b",
    },
  },
  "& .MuiSwitch-thumb": {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  "& .MuiSwitch-track": {
    borderRadius: 14,
    opacity: 1,
    backgroundColor: theme.palette.mode === "light" ? "#cbd5e1" : "#475569",
    transition: theme.transitions.create(["background-color"], {
      duration: 200,
    }),
  },
}));

export const Switch = ({
  label,
  helperText,
  errorMessage,
  labelPlacement = "end",
  color = "primary",
  disabled,
  ...props
}: SwitchProps) => {
  const hasError = Boolean(errorMessage);
  const helper = hasError ? errorMessage : helperText;

  return (
    <Box>
      <FormControlLabel
        label={label}
        labelPlacement={labelPlacement}
        disabled={disabled}
        control={<StyledSwitch color={color} disabled={disabled} {...props} />}
        sx={{
          m: 0,
          gap: 1.25,
          alignItems: "center",
          "& .MuiFormControlLabel-label": {
            fontSize: "0.95rem",
            lineHeight: 1.3,
            color: disabled ? "text.disabled" : "text.primary",
          },
        }}
      />
      {helper ? (
        <FormHelperText
          sx={{
            mt: 0.5,
            ml: 0,
            color: hasError ? "error.main" : "text.secondary",
          }}
        >
          {helper}
        </FormHelperText>
      ) : null}
    </Box>
  );
};
