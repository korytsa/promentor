import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppThemeProvider } from "@promentorapp/ui-kit";
import { ToastContainer } from "react-toastify";
import { QueryProvider } from "./app/providers/QueryProvider";
import { App } from "./app";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <QueryProvider>
        <BrowserRouter>
          <App />
          <ToastContainer position="top-right" newestOnTop />
        </BrowserRouter>
      </QueryProvider>
    </AppThemeProvider>
  </StrictMode>,
);
