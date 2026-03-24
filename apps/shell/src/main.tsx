import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppThemeProvider } from "@promentor/ui-kit";
import { App } from "./app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </StrictMode>,
);
