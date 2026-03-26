import type { SxProps, Theme } from "@mui/material";

export const fieldControlSx: SxProps<Theme> = {
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
