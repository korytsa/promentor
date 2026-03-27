import { createTheme, type PaletteMode } from "@mui/material/styles";

export type AppThemeMode = PaletteMode;

export const createAppTheme = (mode: AppThemeMode) =>
  createTheme({
    palette: {
      mode,
    },
    shape: {
      borderRadius: 12,
    },
  });

export const appTheme = createAppTheme("light");
