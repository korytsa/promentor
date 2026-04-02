import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { applyThemeContract, THEME_STORAGE_KEY } from "./themeContract";
import { createAppTheme, type AppThemeMode } from "./theme";

type AppThemeProviderProps = {
  children: ReactNode;
};

type AppThemeContextValue = {
  mode: AppThemeMode;
  setMode: (mode: AppThemeMode) => void;
  toggleMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

const getInitialMode = (): AppThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [mode, setMode] = useState<AppThemeMode>(getInitialMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    applyThemeContract(mode);
  }, [mode]);

  const contextValue = useMemo<AppThemeContextValue>(
    () => ({ mode, setMode, toggleMode }),
    [mode],
  );

  return (
    <AppThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return context;
}
