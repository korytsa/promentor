import type { AppThemeMode } from "./theme";

export const THEME_STORAGE_KEY = "promentor-theme-mode";

type ThemeCssVars = Record<`--${string}`, string>;

const lightThemeVars: ThemeCssVars = {
  "--pm-bg": "#f4f8ff",
  "--pm-text-primary": "#0f172a",
  "--pm-text-secondary": "#334155",
  "--pm-text-muted": "#64748b",
  "--pm-border": "rgba(148, 163, 184, 0.38)",
  "--pm-border-subtle": "rgba(148, 163, 184, 0.24)",
  "--pm-surface": "rgba(255, 255, 255, 0.84)",
  "--pm-surface-strong": "rgba(255, 255, 255, 0.94)",
  "--pm-surface-overlay": "rgba(248, 250, 252, 0.95)",
  "--pm-surface-hover": "rgba(241, 245, 249, 0.9)",
  "--pm-backdrop": "rgba(15, 23, 42, 0.08)",
  "--pm-divider": "rgba(148, 163, 184, 0.34)",
  "--pm-accent-cyan": "#0891b2",
  "--pm-accent-blue": "#2563eb",
  "--pm-accent-cyan-soft": "rgba(6, 182, 212, 0.09)",
  "--pm-accent-blue-soft": "rgba(59, 130, 246, 0.09)",
  "--pm-accent-cyan-border": "rgba(14, 165, 233, 0.28)",
  "--pm-accent-blue-border": "rgba(37, 99, 235, 0.24)",
  "--pm-dot-cyan": "#0ea5e9",
  "--pm-dot-blue": "#3b82f6",
  "--pm-bg-radial-1": "rgba(56, 189, 248, 0.18)",
  "--pm-bg-radial-2": "rgba(59, 130, 246, 0.13)",
  "--pm-bg-radial-3": "rgba(14, 165, 233, 0.08)",
  "--pm-bg-linear-top": "rgba(255, 255, 255, 0.55)",
  "--pm-bg-linear-bottom": "rgba(224, 242, 254, 0.58)",
  "--pm-grid-line": "rgba(71, 85, 105, 0.08)",
  "--auth-input-bg": "rgba(255, 255, 255, 0.84)",
  "--auth-input-text": "#0f172a",
};

const darkThemeVars: ThemeCssVars = {
  "--pm-bg": "#030712",
  "--pm-text-primary": "#f8fafc",
  "--pm-text-secondary": "#cbd5e1",
  "--pm-text-muted": "#94a3b8",
  "--pm-border": "rgba(255, 255, 255, 0.12)",
  "--pm-border-subtle": "rgba(255, 255, 255, 0.08)",
  "--pm-surface": "rgba(15, 23, 42, 0.56)",
  "--pm-surface-strong": "rgba(2, 6, 23, 0.55)",
  "--pm-surface-overlay": "rgba(15, 23, 42, 0.96)",
  "--pm-surface-hover": "rgba(255, 255, 255, 0.08)",
  "--pm-backdrop": "rgba(0, 0, 0, 0.3)",
  "--pm-divider": "rgba(255, 255, 255, 0.1)",
  "--pm-accent-cyan": "#67e8f9",
  "--pm-accent-blue": "#93c5fd",
  "--pm-accent-cyan-soft": "rgba(6, 182, 212, 0.08)",
  "--pm-accent-blue-soft": "rgba(59, 130, 246, 0.08)",
  "--pm-accent-cyan-border": "rgba(14, 165, 233, 0.28)",
  "--pm-accent-blue-border": "rgba(96, 165, 250, 0.24)",
  "--pm-dot-cyan": "#67e8f9",
  "--pm-dot-blue": "#93c5fd",
  "--pm-bg-radial-1": "rgba(56, 189, 248, 0.24)",
  "--pm-bg-radial-2": "rgba(59, 130, 246, 0.18)",
  "--pm-bg-radial-3": "rgba(14, 165, 233, 0.16)",
  "--pm-bg-linear-top": "rgba(10, 25, 47, 0.28)",
  "--pm-bg-linear-bottom": "rgba(2, 6, 23, 0.92)",
  "--pm-grid-line": "rgba(148, 163, 184, 0.08)",
  "--auth-input-bg": "color-mix(in srgb, rgb(15 23 42) 70%, rgb(2 6 23))",
  "--auth-input-text": "rgb(241 245 249)",
};

const themeVarsByMode: Record<AppThemeMode, ThemeCssVars> = {
  light: lightThemeVars,
  dark: darkThemeVars,
};

export function applyThemeContract(mode: AppThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const vars = themeVarsByMode[mode];

  root.setAttribute("data-theme", mode);
  root.classList.toggle("dark", mode === "dark");

  Object.entries(vars).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}
